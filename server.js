import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const root = dirname(fileURLToPath(import.meta.url));
const dataFile = process.env.WORLDTIERS_DATA_FILE ? resolve(process.env.WORLDTIERS_DATA_FILE) : join(root, 'data', 'worldtiers.json');
const dataBackupFile = `${dataFile}.backup`;
let databaseCache = null;
const dist = join(root, 'dist');
const port = Number(process.env.PORT || 3001);
const adminPassword = process.env.ADMIN_PASSWORD || '';
const adminSessionSecret = process.env.ADMIN_SESSION_SECRET || adminPassword;
const botApiSecret = process.env.BOT_API_SECRET || '';
const adminSessionVersion = randomUUID();
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
};

const tierPoints = { HT1: 60, LT1: 45, HT2: 30, LT2: 20, HT3: 10, LT3: 6, HT4: 4, LT4: 3, HT5: 2, LT5: 1 };
const allowedRoles = new Set(['friend', 'tester', 'goat', 'verified', 'media']);
const defaultSeason = { id: 'saison-1', name: 'Saison PvP 1', status: 'active', starts_at: '2026-07-01T00:00:00.000Z', ends_at: null };
const fallbackAnnouncements = [
  'Bienvenue sur WorldTiers ! Fais tes preuves et monte dans le classement.',
  'Les points sont calculés automatiquement selon les tiers validés.',
  'Retrouve ton profil, tes tiers et les classements de chaque mode ici.',
];
const modes = [
  ['crystal', 'Vanilla'], ['sword', 'Sword'], ['uhc', 'UHC'], ['nethpot', 'Neth Pot'], ['pot', 'Pot'],
  ['smp', 'SMP'], ['axe', 'Axe'], ['diasmp', 'Dia SMP'], ['mace', 'Mace'], ['spear-mace', 'Spear Mace'],
].map(([slug, name]) => ({ slug, name }));

const getMode = (slug) => modes.find((mode) => mode.slug === slug);
const validUsername = (value) => /^[a-zA-Z0-9_]{3,16}$/.test(value);
const validUuid = (value) => /^[a-f0-9]{32}$/.test(value);
const sortByPoints = (a, b) => b.points - a.points || a.username.localeCompare(b.username);
const sortByMode = (mode) => (a, b) =>
  (tierPoints[b.tiers?.[mode]] || 0) - (tierPoints[a.tiers?.[mode]] || 0) || sortByPoints(a, b);

const apiDocs = {
  name: 'WorldTiers API',
  version: '1.0.0',
  message: 'API publique WorldTiers : choisis une route ci-dessous.',
  endpoints: {
    health: '/api/health',
    players: '/api/players',
    top100: '/api/top100',
    stats: '/api/stats',
    modes: '/api/modes',
    player: '/api/user/:username',
    modeLeaderboard: '/api/:mode',
    modePlayer: '/api/:mode/user/:username',
    minecraftUuid: '/api/minecraft/:username',
    export: '/api/export/players',
    season: '/api/season',
    announcement: '/api/announcements/current',
    v1Branding: '/api/v1/branding',
    v1Modes: '/api/v1/modes',
    v1Leaderboard: '/api/v1/leaderboard/:mode',
  },
};

function sendJson(res, status, body, extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type',
    ...extraHeaders,
  });
  res.end(status === 204 ? '' : JSON.stringify(body));
}

async function readDatabase() {
  if (databaseCache) return databaseCache;
  try {
    databaseCache = JSON.parse(await readFile(dataFile, 'utf8'));
  } catch {
    databaseCache = JSON.parse(await readFile(dataBackupFile, 'utf8'));
  }
  return databaseCache;
}

async function saveDatabase(database) {
  await mkdir(dirname(dataFile), { recursive: true });
  try { await copyFile(dataFile, dataBackupFile); } catch {}
  await writeFile(dataFile, `${JSON.stringify(database, null, 2)}\n`);
  databaseCache = database;
}

function refreshPoints(player) {
  player.points = Object.values(player.tiers || {}).reduce((total, tier) => total + (tierPoints[tier] || 0), 0);
}

function publicPlayer(player) {
  return {
    id: player.id,
    username: player.username,
    minecraft_uuid: player.minecraft_uuid,
    skinHash: player.minecraft_uuid,
    region: player.region,
    points: player.points,
    retired: Boolean(player.retired),
    created_at: player.created_at,
    joinedAt: player.created_at,
    tiers: player.tiers || {},
    history: player.history || [],
    roles: player.roles || [],
  };
}

function rankedPlayer(player, rank) {
  return { ...publicPlayer(player), rank };
}

function readCookie(req, name) {
  return (req.headers.cookie || '').split(';').map((value) => value.trim()).find((value) => value.startsWith(`${name}=`))?.slice(name.length + 1) || '';
}

function signedSession() {
  const expires = Date.now() + 1000 * 60 * 60 * 12;
  const payload = `${adminSessionVersion}.${expires}`;
  const signature = createHmac('sha256', adminSessionSecret).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

function hasAdminSession(req) {
  if (!adminPassword || !adminSessionSecret) return false;
  const [version, expires, signature] = readCookie(req, 'wt_admin').split('.');
  if (!version || version !== adminSessionVersion || !expires || !signature || Number(expires) < Date.now()) return false;
  const expected = createHmac('sha256', adminSessionSecret).update(`${version}.${expires}`).digest('hex');
  return signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

async function handleAdminLogin(req, res) {
  const payload = await requestBody(req);
  const password = String(payload.password || '');
  if (!adminPassword || password.length !== adminPassword.length || !timingSafeEqual(Buffer.from(password), Buffer.from(adminPassword))) {
    return sendJson(res, 404, { error: 'Endpoint API introuvable' });
  }
  const secure = req.headers['x-forwarded-proto'] === 'https' || Boolean(req.socket.encrypted);
  return sendJson(res, 200, { ok: true }, { 'Set-Cookie': `wt_admin=${signedSession()}; Path=/; HttpOnly; SameSite=Strict;${secure ? ' Secure;' : ''} Max-Age=43200` });
}

function handleAdminAccess(req, res) {
  return hasAdminSession(req) ? sendJson(res, 200, { ok: true }) : sendJson(res, 404, { error: 'Endpoint API introuvable' });
}

function hasBotSecret(req) {
  const provided = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  return Boolean(botApiSecret) && provided.length === botApiSecret.length && timingSafeEqual(Buffer.from(provided), Buffer.from(botApiSecret));
}

async function handleBotRequest(req, res, pathname) {
  if (!hasBotSecret(req)) return sendJson(res, 404, { error: 'Endpoint API introuvable' });
  const payload = await requestBody(req);
  const database = await readDatabase();
  if (pathname === '/api/bot/roles') {
    const player = database.players.find((item) => item.username.toLowerCase() === String(payload.username || '').toLowerCase());
    const role = String(payload.role || '');
    if (!player || !allowedRoles.has(role)) return sendJson(res, 400, { ok: false, error: 'Joueur ou rôle invalide' });
    const roles = new Set(player.roles || []);
    if (payload.enabled) roles.add(role); else roles.delete(role);
    player.roles = [...roles];
    await saveDatabase(database);
    return sendJson(res, 200, { ok: true, roles: player.roles });
  }
  if (pathname === '/api/bot/test-result') {
    const player = database.players.find((item) => item.username.toLowerCase() === String(payload.username || '').toLowerCase());
    const mode = getMode(String(payload.mode_id || ''));
    const tier = String(payload.tier || '');
    if (!player || !mode || !tierPoints[tier]) return sendJson(res, 400, { ok: false, error: 'Résultat de test invalide' });
    player.tiers ||= {};
    const previousTier = player.tiers[mode.slug] || null;
    player.tiers[mode.slug] = tier;
    if (previousTier !== tier) player.history = [{ id: randomUUID(), date: new Date().toISOString(), mode: mode.slug, from: previousTier, tier, action: 'tier_validated', author: String(payload.tester || 'Testeur Discord').slice(0, 80) }, ...(player.history || [])];
    refreshPoints(player);
    await saveDatabase(database);
    return sendJson(res, 200, { ok: true, points: player.points });
  }
  const message = String(payload.message || '').trim();
  if (!message || message.length > 500) return sendJson(res, 400, { ok: false, error: 'Annonce invalide' });
  const author = String(payload.author || 'WorldTiers Discord').trim().slice(0, 80) || 'WorldTiers Discord';
  database.announcements = [{ id: randomUUID(), message, author, active: true, created_at: new Date().toISOString() }, ...(database.announcements || []).map((item) => ({ ...item, active: false }))];
  await saveDatabase(database);
  return sendJson(res, 200, { ok: true });
}

async function requestBody(req) {
  let text = '';
  for await (const chunk of req) {
    text += chunk;
    if (text.length > 1_000_000) throw new Error('Requête trop grande');
  }
  return text ? JSON.parse(text) : {};
}

async function handleAdmin(req, res) {
  if (!hasAdminSession(req)) {
    return sendJson(res, 404, { error: 'Endpoint API introuvable' });
  }

  const database = await readDatabase();

  const payload = await requestBody(req);
  const input = payload.player || {};

  if (payload.action === 'add_player' || payload.action === 'update_player') {
    const username = String(input.username || '').trim();
    const minecraftUuid = String(input.minecraft_uuid || '').replaceAll('-', '').trim().toLowerCase();
    if (!validUsername(username) || !validUuid(minecraftUuid)) {
      return sendJson(res, 400, { ok: false, error: 'Pseudo ou UUID invalide' });
    }
    const duplicate = database.players.find((player) =>
      (player.username.toLowerCase() === username.toLowerCase() || player.minecraft_uuid === minecraftUuid)
      && player.id !== payload.id);
    if (duplicate) return sendJson(res, 409, { ok: false, error: 'Ce pseudo ou cet UUID existe déjà' });

    const values = {
      username,
      minecraft_uuid: minecraftUuid,
      region: ['EU', 'NA', 'AS', 'SA'].includes(input.region) ? input.region : 'EU',
      retired: Boolean(input.retired),
    };
    // The normal profile editor does not manage roles: never erase them while saving tiers or profile fields.
    if (Array.isArray(input.roles)) values.roles = [...new Set(input.roles.filter((role) => allowedRoles.has(role)))];
    if (payload.action === 'add_player') {
      const player = { id: randomUUID(), ...values, roles: values.roles || [], points: 0, created_at: new Date().toISOString(), tiers: {}, history: [] };
      database.players.push(player);
      await saveDatabase(database);
      return sendJson(res, 201, { ok: true, id: player.id });
    }

    const player = database.players.find((item) => item.id === payload.id);
    if (!player) return sendJson(res, 404, { ok: false, error: 'Profil introuvable' });
    Object.assign(player, values);
    refreshPoints(player);
    await saveDatabase(database);
    return sendJson(res, 200, { ok: true, id: player.id });
  }

  const player = database.players.find((item) => item.id === (payload.player_id || payload.id));
  if (payload.action === 'set_roles') {
    if (!player) return sendJson(res, 404, { ok: false, error: 'Profil introuvable' });
    player.roles = Array.isArray(payload.roles) ? [...new Set(payload.roles.filter((role) => allowedRoles.has(role)))] : [];
    await saveDatabase(database);
    return sendJson(res, 200, { ok: true, roles: player.roles });
  }
  if (payload.action === 'set_announcement') {
    const message = String(payload.message || '').trim();
    if (!message || message.length > 500) return sendJson(res, 400, { ok: false, error: 'Annonce invalide' });
    const author = String(payload.author || 'Staff WorldTiers').trim().slice(0, 80) || 'Staff WorldTiers';
    database.announcements = [{ id: randomUUID(), message, author, active: true, created_at: new Date().toISOString() }, ...(database.announcements || []).map((item) => ({ ...item, active: false }))];
    await saveDatabase(database);
    return sendJson(res, 200, { ok: true, announcement: database.announcements[0] });
  }
  if (payload.action === 'set_season') {
    const name = String(payload.name || '').trim().slice(0, 80);
    if (!name) return sendJson(res, 400, { ok: false, error: 'Nom de saison invalide' });
    database.season = { ...defaultSeason, ...database.season, name, status: payload.status === 'finished' ? 'finished' : 'active', starts_at: payload.starts_at || database.season?.starts_at || new Date().toISOString(), ends_at: payload.ends_at || null };
    await saveDatabase(database);
    return sendJson(res, 200, { ok: true, season: database.season });
  }
  if (payload.action === 'delete_player') {
    if (!player) return sendJson(res, 404, { ok: false, error: 'Profil introuvable' });
    database.players = database.players.filter((item) => item.id !== player.id);
    await saveDatabase(database);
    return sendJson(res, 200, { ok: true });
  }

  if (payload.action === 'set_tier' || payload.action === 'remove_tier') {
    if (!player) return sendJson(res, 404, { ok: false, error: 'Profil introuvable' });
    const mode = getMode(String(payload.mode_id || ''));
    if (!mode) return sendJson(res, 400, { ok: false, error: 'Mode invalide' });
    const previousTier = player.tiers[mode.slug] || null;
    if (payload.action === 'remove_tier') {
      delete player.tiers[mode.slug];
    } else if (tierPoints[payload.tier]) {
      player.tiers[mode.slug] = payload.tier;
    } else {
      return sendJson(res, 400, { ok: false, error: 'Tier invalide' });
    }
    const nextTier = player.tiers[mode.slug] || null;
    if (previousTier !== nextTier) {
      player.history = [{
        id: randomUUID(), date: new Date().toISOString(), mode: mode.slug, from: previousTier,
        tier: nextTier, action: nextTier ? 'tier_updated' : 'tier_removed', author: 'Staff WorldTiers',
      }, ...(player.history || [])];
    }
    refreshPoints(player);
    await saveDatabase(database);
    return sendJson(res, 200, { ok: true, points: player.points });
  }

  return sendJson(res, 400, { ok: false, error: 'Action non autorisée' });
}

async function fetchMinecraftUuid(res, username) {
  if (!validUsername(username)) return sendJson(res, 400, { error: 'Pseudo Minecraft invalide' });
  const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`);
  if (response.status === 204 || response.status === 404) return sendJson(res, 404, { error: 'Pseudo Minecraft introuvable' });
  if (!response.ok) throw new Error('Mojang indisponible');
  const player = await response.json();
  return sendJson(res, 200, { username: player.name, uuid: player.id });
}

function modeResponse(player, rank, mode) {
  const tier = player.tiers[mode.slug];
  return { ...rankedPlayer(player, rank), mode, tier, modePoints: tierPoints[tier] };
}

async function handleApi(req, res, url) {
  const { pathname } = url;
  const parts = pathname.split('/').filter(Boolean);
  if (req.method === 'OPTIONS') return sendJson(res, 204, {});
  if (req.method === 'POST' && pathname === '/api/admin/login') return handleAdminLogin(req, res);
  if (req.method === 'POST' && ['/api/bot/announcement', '/api/bot/roles', '/api/bot/test-result'].includes(pathname)) return handleBotRequest(req, res, pathname);
  if (pathname === '/api/admin') {
    if (req.method === 'POST') return handleAdmin(req, res);
    if (req.method === 'GET') return handleAdminAccess(req, res);
  }
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Méthode non autorisée' });

  if (pathname === '/api') return sendJson(res, 200, apiDocs);
  if (pathname === '/api/health') return sendJson(res, 200, { ok: true, service: 'WorldTiers API', version: '1.0.0' });
  if (pathname === '/api/v1/branding') {
    return sendJson(res, 200, {
      name: 'WorldTiers', displayName: 'WorldTiers', website: `${url.protocol}//${url.host}`,
      apiVersion: 'v1', logo: '/favicon.png', discord: null,
    });
  }
  if (pathname === '/api/modes' || pathname === '/api/v1/modes') return sendJson(res, 200, modes);
  if (parts[1] === 'minecraft' && parts[2]) return fetchMinecraftUuid(res, decodeURIComponent(parts[2]));

  const database = await readDatabase();
  const players = [...database.players].sort(sortByPoints);
  if (pathname === '/api/season') return sendJson(res, 200, database.season || defaultSeason);
  if (pathname === '/api/announcements/current') {
    const announcement = (database.announcements || []).find((item) => item.active);
    const fallback = fallbackAnnouncements[new Date().getDate() % fallbackAnnouncements.length];
    return sendJson(res, 200, announcement || { id: 'bob-default', active: false, message: fallback, author: 'Bob', created_at: null });
  }
  if (pathname === '/api/export/players') {
    return sendJson(res, 200, {
      generated_at: new Date().toISOString(), season: database.season || defaultSeason,
      total_players: players.length, players: players.map((player, index) => rankedPlayer(player, index + 1)),
    });
  }
  if (pathname === '/api/players' || pathname === '/api/top100') {
    const limit = pathname === '/api/top100' ? 100 : players.length;
    return sendJson(res, 200, players.slice(0, limit).map((player, index) => rankedPlayer(player, index + 1)));
  }
  if (pathname === '/api/stats') {
    return sendJson(res, 200, {
      players: players.length,
      activePlayers: players.filter((player) => !player.retired).length,
      totalPoints: players.reduce((total, player) => total + player.points, 0),
      modes: Object.fromEntries(modes.map((mode) => [mode.slug, players.filter((player) => player.tiers?.[mode.slug]).length])),
    });
  }

  const isPlayerRoute = parts[1] === 'user' || (parts[1] === 'v1' && parts[2] === 'players');
  if (isPlayerRoute) {
    const requestedName = parts[1] === 'user' ? parts[2] : parts[3];
    const player = players.find((item) => item.username.toLowerCase() === decodeURIComponent(requestedName || '').toLowerCase());
    return player
      ? sendJson(res, 200, rankedPlayer(player, players.indexOf(player) + 1))
      : sendJson(res, 404, { error: 'Joueur introuvable' });
  }

  const leaderboardV1 = parts[1] === 'v1' && parts[2] === 'leaderboard';
  const modeSlug = leaderboardV1 ? parts[3] : parts[1];
  const mode = getMode(modeSlug);
  if (!mode) return sendJson(res, 404, { error: 'Endpoint API introuvable', docs: '/api' });

  const ranked = players.filter((player) => player.tiers?.[mode.slug]).sort(sortByMode(mode.slug));
  const requestedName = !leaderboardV1 && parts[2] === 'user' ? parts[3] : null;
  if (requestedName) {
    const player = ranked.find((item) => item.username.toLowerCase() === decodeURIComponent(requestedName).toLowerCase());
    return player
      ? sendJson(res, 200, modeResponse(player, ranked.indexOf(player) + 1, mode))
      : sendJson(res, 404, { error: 'Joueur non classé dans ce mode' });
  }
  return sendJson(res, 200, ranked.map((player, index) => modeResponse(player, index + 1, mode)));
}

async function serveStatic(req, res, url) {
  let pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  let file = normalize(join(dist, pathname));
  if (!file.startsWith(dist)) return sendJson(res, 403, { error: 'Interdit' });
  try {
    if ((await stat(file)).isDirectory()) file = join(dist, 'index.html');
    res.writeHead(200, { 'Content-Type': mimeTypes[extname(file)] || 'application/octet-stream' });
    createReadStream(file).pipe(res);
  } catch {
    try {
      file = join(dist, 'index.html');
      res.writeHead(200, { 'Content-Type': mimeTypes['.html'] });
      createReadStream(file).pipe(res);
    } catch {
      sendJson(res, 503, { error: 'Lance npm run build puis npm start.' });
    }
  }
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api')) return handleApi(req, res, url);
    return serveStatic(req, res, url);
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { ok: false, error: 'Erreur serveur' });
  }
}).listen(port, '0.0.0.0', () => console.log(`WorldTiers: http://localhost:${port}`));
