import {
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Client, EmbedBuilder,
  GatewayIntentBits, ModalBuilder, PermissionFlagsBits, TextInputBuilder, TextInputStyle,
} from 'discord.js';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

try { process.loadEnvFile?.('.env'); } catch {}

const root = dirname(fileURLToPath(import.meta.url));
const storageFile = join(root, 'discord-bot.json');
const api = (process.env.WORLDTIERS_API_URL || 'https://worldtiers.ddns.net/api').replace(/\/$/, '');
const siteUrl = api.replace(/\/api$/, '');
const modes = ['crystal', 'sword', 'uhc', 'nethpot', 'pot', 'smp', 'axe', 'diasmp', 'mace', 'spear-mace'];
const tiers = new Set(['HT1', 'LT1', 'HT2', 'LT2', 'HT3', 'LT3', 'HT4', 'LT4', 'HT5', 'LT5']);
const modeLabels = {
  crystal: '💎 Vanilla', sword: '⚔️ Sword', uhc: '❤️ UHC', nethpot: '🟣 Neth Pot',
  pot: '⚗️ Pot', smp: '🟢 SMP', axe: '🪓 Axe', diasmp: '🌙 Dia SMP',
  mace: '🔨 Mace', 'spear-mace': '🗡️ Spear Mace',
};

let database = {};
try { database = JSON.parse(await readFile(storageFile, 'utf8')); } catch {}
const configFor = guildId => {
  database[guildId] ||= { panels: {}, tests: {} };
  database[guildId].panels ||= {};
  database[guildId].tests ||= {};
  database[guildId].tickets ||= {};
  return database[guildId];
};
const save = async () => { await mkdir(root, { recursive: true }); await writeFile(storageFile, JSON.stringify(database, null, 2)); };
const validMinecraftName = name => /^[a-zA-Z0-9_]{3,16}$/.test(name);
const id = () => crypto.randomUUID();
const isTester = (member, config) => Boolean(config.testerRoleId && member.roles.cache.has(config.testerRoleId));
const isAdmin = member => member.permissions.has(PermissionFlagsBits.Administrator);
const worldTiersEmbed = (title, description, color = 0x5865f2) => new EmbedBuilder().setColor(color).setTitle(title).setDescription(description).setFooter({ text: 'WorldTiers • Tests PvP' }).setTimestamp();

function queueEmbed(panel) {
  const lines = [0, 1, 2, 3, 4].map(index => {
    const player = panel.players[index];
    return `${index + 1}. ${player ? `<@${player.discordId}> — **${player.minecraftName}**` : '—'}`;
  });
  return worldTiersEmbed(
    'Tier test',
    `**Testeurs :** <@${panel.testerId}>\n**Modes :** ${panel.modes.map(mode => modeLabels[mode]).join(' • ')}\n\n**File d’attente**\n${lines.join('\n')}\n\nClique sur **Rejoindre** puis remplis le formulaire.`,
    0x9b6cff,
  );
}

function queueButtons(panel) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`wtq:join:${panel.id}`).setLabel(`Rejoindre (${panel.players.length}/5)`).setEmoji('➕').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`wtq:leave:${panel.id}`).setLabel('Quitter').setEmoji('➖').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`wtq:start:${panel.id}`).setLabel('Prendre le premier test').setEmoji('▶️').setStyle(ButtonStyle.Success).setDisabled(panel.players.length === 0),
  );
}

async function refreshPanel(guild, panel) {
  const channel = await guild.channels.fetch(panel.channelId).catch(() => null);
  const message = channel?.isTextBased() ? await channel.messages.fetch(panel.messageId).catch(() => null) : null;
  await message?.edit({ embeds: [queueEmbed(panel)], components: [queueButtons(panel)] });
}

async function createTestChannel(interaction, config, panel) {
  const player = panel.players.shift();
  const overwrites = [
    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: player.discordId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
  ];
  const channel = await interaction.guild.channels.create({
    name: `test-${panel.modes.join('-')}-${player.minecraftName}`.toLowerCase().replace(/[^a-z0-9-]/g, ''),
    type: ChannelType.GuildText,
    parent: config.testCategoryId || undefined,
    permissionOverwrites: overwrites,
  });
  config.tests[channel.id] = { player, testerId: interaction.user.id, modes: panel.modes, panelId: panel.id, createdAt: new Date().toISOString() };
  await save();
  await channel.send({
    content: `<@${player.discordId}> <@${interaction.user.id}>`,
    embeds: [worldTiersEmbed('Test de tier ouvert', `**Joueur Discord :** <@${player.discordId}>\n**Joueur Minecraft :** **${player.minecraftName}**\n**Testeur :** <@${interaction.user.id}>\n**Modes :** ${panel.modes.map(mode => modeLabels[mode]).join(' • ')}\n\nÀ la fin, le testeur utilise `/tieraccept` ou `/tierrefuse`.`)],
  });
  await refreshPanel(interaction.guild, panel);
  return channel;
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once('ready', () => console.log(`WorldTiers Bot connecté : ${client.user.tag}`));

client.on('interactionCreate', async interaction => {
  try {
    if (!interaction.guild) return;
    const config = configFor(interaction.guild.id);

    if (interaction.isButton()) {
      const [namespace, action, panelId] = interaction.customId.split(':');
      if (namespace !== 'wtq') return;
      const panel = config.panels[panelId];
      if (!panel) return interaction.reply({ content: 'Cette file n’existe plus.', ephemeral: true });

      if (action === 'join') {
        if (panel.players.some(player => player.discordId === interaction.user.id)) return interaction.reply({ content: 'Tu es déjà dans cette file.', ephemeral: true });
        if (panel.players.length >= 5) return interaction.reply({ content: 'La file est complète.', ephemeral: true });
        const modal = new ModalBuilder().setCustomId(`wtqform:${panel.id}`).setTitle('Rejoindre la file de test');
        modal.addComponents(
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('discord_name').setLabel('Ton pseudo Discord').setStyle(TextInputStyle.Short).setValue(interaction.user.username).setRequired(true).setMaxLength(32)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('minecraft_name').setLabel('Ton pseudo Minecraft').setStyle(TextInputStyle.Short).setPlaceholder('Ex. belyxzor').setRequired(true).setMinLength(3).setMaxLength(16)),
        );
        return interaction.showModal(modal);
      }

      if (action === 'leave') {
        const count = panel.players.length;
        panel.players = panel.players.filter(player => player.discordId !== interaction.user.id);
        if (count === panel.players.length) return interaction.reply({ content: 'Tu n’es pas dans cette file.', ephemeral: true });
        await save();
        return interaction.update({ embeds: [queueEmbed(panel)], components: [queueButtons(panel)] });
      }

      if (action === 'start') {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!isTester(member, config)) return interaction.reply({ content: 'Seuls les testeurs peuvent prendre un test.', ephemeral: true });
        if (panel.testerId !== interaction.user.id && !isAdmin(member)) return interaction.reply({ content: 'Seul le testeur qui a créé cette file peut prendre ses joueurs.', ephemeral: true });
        if (!panel.players.length) return interaction.reply({ content: 'La file est vide.', ephemeral: true });
        const channel = await createTestChannel(interaction, config, panel);
        return interaction.reply({ content: `Salon de test créé : ${channel}`, ephemeral: true });
      }
      return;
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('wtqform:')) {
      const panel = config.panels[interaction.customId.slice('wtqform:'.length)];
      if (!panel) return interaction.reply({ content: 'Cette file n’existe plus.', ephemeral: true });
      const discordName = interaction.fields.getTextInputValue('discord_name').trim();
      const minecraftName = interaction.fields.getTextInputValue('minecraft_name').trim();
      if (!validMinecraftName(minecraftName)) return interaction.reply({ content: 'Pseudo Minecraft invalide : 3 à 16 caractères, seulement lettres, chiffres et _.', ephemeral: true });
      if (panel.players.some(player => player.discordId === interaction.user.id)) return interaction.reply({ content: 'Tu es déjà dans cette file.', ephemeral: true });
      if (panel.players.length >= 5) return interaction.reply({ content: 'La file est complète.', ephemeral: true });
      panel.players.push({ discordId: interaction.user.id, discordName, minecraftName });
      await save();
      await refreshPanel(interaction.guild, panel);
      return interaction.reply({ content: `Tu es dans la file avec le pseudo Minecraft **${minecraftName}**.`, ephemeral: true });
    }

    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'setup') {
      config.testerRoleId = interaction.options.getRole('testeurs', true).id;
      config.testCategoryId = interaction.options.getChannel('categorie_tests')?.id || null;
      config.ticketCategoryId = interaction.options.getChannel('categorie_tickets')?.id || null;
      config.staffRoleId = interaction.options.getRole('staff')?.id || null;
      config.reportChannelId = interaction.options.getChannel('reports')?.id || null;
      await save();
      return interaction.reply({ embeds: [worldTiersEmbed('Bot WorldTiers configuré', `**Testeurs :** <@&${config.testerRoleId}>\n**Staff :** ${config.staffRoleId ? `<@&${config.staffRoleId}>` : 'non configuré'}\n**Reports :** ${config.reportChannelId ? `<#${config.reportChannelId}>` : 'non configuré'}`)], ephemeral: true });
    }

    if (interaction.commandName === 'site' || interaction.commandName === 'web' || interaction.commandName === 'vanilla' || modes.includes(interaction.commandName)) {
      const mode = interaction.commandName === 'vanilla' ? 'crystal' : interaction.commandName;
      const url = modes.includes(mode) ? `${siteUrl}/mode/${mode}` : siteUrl;
      const label = modes.includes(mode) ? `Classement ${modeLabels[mode]}` : 'Site officiel WorldTiers';
      return interaction.reply({ embeds: [worldTiersEmbed(label, `[Ouvrir la page](${url})`).setURL(url)] });
    }

    if (interaction.commandName === 'profil' || interaction.commandName === 'tier') {
      const username = interaction.options.getString('name', true).trim();
      const response = await fetch(`${api}/user/${encodeURIComponent(username)}`);
      const player = await response.json().catch(() => ({}));
      if (!response.ok) return interaction.reply({ content: 'Joueur WorldTiers introuvable.', ephemeral: true });
      const entries = Object.entries(player.tiers || {}).map(([mode, tier]) => `${modeLabels[mode] || mode} **${tier}**`).join('\n') || 'Aucun tier validé.';
      const url = `${siteUrl}/player/${encodeURIComponent(player.username)}`;
      const title = interaction.commandName === 'tier' ? `Tiers de ${player.username}` : `Profil WorldTiers — ${player.username}`;
      const description = interaction.commandName === 'tier' ? `${entries}\n\n[Voir le profil complet](${url})` : `**Rang :** #${player.rank || 'N/A'} • **${player.points || 0} points**\n**Région :** ${player.region || 'N/A'}\n\n${entries}\n\n[Ouvrir le profil](${url})`;
      return interaction.reply({ embeds: [worldTiersEmbed(title, description).setURL(url)] });
    }

    if (interaction.commandName === 'top') {
      const mode = interaction.options.getString('mode');
      const response = await fetch(`${api}/${mode || 'top100'}`);
      const players = await response.json().catch(() => []);
      if (!response.ok || !Array.isArray(players)) return interaction.reply({ content: 'Classement indisponible.', ephemeral: true });
      const list = players.slice(0, 10).map((player, index) => `**${index + 1}.** [${player.username}](${siteUrl}/player/${encodeURIComponent(player.username)}) — ${mode ? player.tier || 'N/A' : `${player.points || 0} pts`}`).join('\n') || 'Aucun joueur classé.';
      const url = mode ? `${siteUrl}/mode/${mode}` : `${siteUrl}/home`;
      return interaction.reply({ embeds: [worldTiersEmbed(`Top ${mode ? modeLabels[mode] : 'WorldTiers'}`, `${list}\n\n[Voir le classement complet](${url})`).setURL(url)] });
    }

    if (interaction.commandName === 'reporte') {
      const target = interaction.options.getUser('membre', true);
      const reason = interaction.options.getString('raison', true);
      const channel = config.reportChannelId && await interaction.guild.channels.fetch(config.reportChannelId).catch(() => null);
      if (!channel?.isTextBased()) return interaction.reply({ content: 'Le salon des reports n’est pas configuré. Utilise /setup.', ephemeral: true });
      await channel.send({ content: config.staffRoleId ? `<@&${config.staffRoleId}>` : '', allowedMentions: { roles: config.staffRoleId ? [config.staffRoleId] : [] }, embeds: [worldTiersEmbed('Nouveau report', `**Signalé par :** <@${interaction.user.id}>\n**Membre :** <@${target.id}>\n**Raison :** ${reason}`, 0xf4b942)] });
      return interaction.reply({ content: 'Ton report a été envoyé au staff.', ephemeral: true });
    }

    if (interaction.commandName === 'ban' || interaction.commandName === 'kick' || interaction.commandName === 'mute') {
      const target = interaction.options.getUser('membre', true);
      const reason = interaction.options.getString('raison', true);
      const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
      if (!targetMember) return interaction.reply({ content: 'Membre introuvable sur ce serveur.', ephemeral: true });
      if (interaction.commandName === 'ban') await targetMember.ban({ reason });
      if (interaction.commandName === 'kick') await targetMember.kick(reason);
      if (interaction.commandName === 'mute') await targetMember.timeout(interaction.options.getInteger('minutes', true) * 60_000, reason);
      const action = interaction.commandName === 'ban' ? 'banni' : interaction.commandName === 'kick' ? 'expulsé' : 'mute';
      return interaction.reply({ embeds: [worldTiersEmbed(`Membre ${action}`, `${target} — ${reason}`, 0xed4245)] });
    }

    if (interaction.commandName === 'ticket') {
      const subcommand = interaction.options.getSubcommand();
      const currentTicket = config.tickets[interaction.channelId];
      const member = await interaction.guild.members.fetch(interaction.user.id);
      const staff = isAdmin(member) || Boolean(config.staffRoleId && member.roles.cache.has(config.staffRoleId));
      if (subcommand === 'create') {
        const subject = interaction.options.getString('sujet', true);
        const overwrites = [{ id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] }, { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }];
        if (config.staffRoleId) overwrites.push({ id: config.staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
        const channel = await interaction.guild.channels.create({ name: `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, ''), type: ChannelType.GuildText, parent: config.ticketCategoryId || undefined, permissionOverwrites: overwrites });
        config.tickets[channel.id] = { ownerId: interaction.user.id, members: [interaction.user.id], createdAt: new Date().toISOString() }; await save();
        await channel.send({ content: `${interaction.user}${config.staffRoleId ? ` <@&${config.staffRoleId}>` : ''}`, allowedMentions: { users: [interaction.user.id], roles: config.staffRoleId ? [config.staffRoleId] : [] }, embeds: [worldTiersEmbed('Ticket WorldTiers', `**Sujet :** ${subject}\nUtilise /ticket ferme quand le problème est résolu.`)] });
        return interaction.reply({ content: `Ticket créé : ${channel}`, ephemeral: true });
      }
      if (!currentTicket) return interaction.reply({ content: 'Cette commande doit être utilisée dans un ticket WorldTiers.', ephemeral: true });
      if (!staff && currentTicket.ownerId !== interaction.user.id) return interaction.reply({ content: 'Tu ne peux pas gérer ce ticket.', ephemeral: true });
      if (subcommand === 'add') {
        const target = interaction.options.getUser('membre', true);
        await interaction.channel.permissionOverwrites.edit(target.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
        if (!currentTicket.members.includes(target.id)) currentTicket.members.push(target.id); await save();
        return interaction.reply({ content: `${target} a été ajouté au ticket.` });
      }
      if (subcommand === 'kick') {
        if (!staff) return interaction.reply({ content: 'Seul le staff peut retirer quelqu’un du ticket.', ephemeral: true });
        const target = interaction.options.getUser('membre', true);
        if (target.id === currentTicket.ownerId) return interaction.reply({ content: 'Le créateur du ticket ne peut pas être retiré.', ephemeral: true });
        await interaction.channel.permissionOverwrites.edit(target.id, { ViewChannel: false, SendMessages: false });
        currentTicket.members = currentTicket.members.filter(userId => userId !== target.id); await save();
        return interaction.reply({ content: `${target} a été retiré du ticket.` });
      }
      delete config.tickets[interaction.channelId]; await save();
      await interaction.reply({ content: 'Ticket fermé dans 5 secondes.' });
      return setTimeout(() => interaction.channel.delete('Ticket fermé').catch(() => {}), 5_000);
    }
    if (interaction.commandName === 'testconfig') {
      config.testerRoleId = interaction.options.getRole('testeurs', true).id;
      config.testCategoryId = interaction.options.getChannel('categorie')?.id || null;
      await save();
      return interaction.reply({ embeds: [worldTiersEmbed('Système de tests configuré', `Rôle Testeur : <@&${config.testerRoleId}>`)], ephemeral: true });
    }

    if (interaction.commandName === 'tierfille') {
      const member = await interaction.guild.members.fetch(interaction.user.id);
      if (!isTester(member, config)) return interaction.reply({ content: 'Tu dois avoir le rôle Discord Testeur.', ephemeral: true });
      const selectedModes = [...new Set(interaction.options.getString('modes', true).toLowerCase().split(',').map(mode => mode.trim()).filter(mode => modes.includes(mode)))];
      if (!selectedModes.length) return interaction.reply({ content: `Aucun mode valide. Choisis parmi : ${modes.join(', ')}`, ephemeral: true });
      const rolePing = interaction.options.getRole('role_ping');
      const panel = { id: id(), testerId: interaction.user.id, modes: selectedModes, players: [], channelId: interaction.channelId, messageId: null, rolePingId: rolePing?.id || null };
      const message = await interaction.channel.send({ content: rolePing ? `<@&${rolePing.id}>` : '', allowedMentions: { roles: rolePing ? [rolePing.id] : [] }, embeds: [queueEmbed(panel)], components: [queueButtons(panel)] });
      panel.messageId = message.id;
      config.panels[panel.id] = panel;
      await save();
      return interaction.reply({ content: 'File de test créée.', ephemeral: true });
    }

    const test = config.tests[interaction.channelId];
    if (interaction.commandName === 'tieraccept' || interaction.commandName === 'tierrefuse') {
      if (!test) return interaction.reply({ content: 'Utilise cette commande dans un salon de test WorldTiers.', ephemeral: true });
      const member = await interaction.guild.members.fetch(interaction.user.id);
      if (test.testerId !== interaction.user.id && !isAdmin(member)) return interaction.reply({ content: 'Seul le testeur assigné peut terminer ce test.', ephemeral: true });
      if (interaction.commandName === 'tierrefuse') {
        const reason = interaction.options.getString('raison', true);
        delete config.tests[interaction.channelId]; await save();
        return interaction.reply({ embeds: [worldTiersEmbed('Test refusé', reason, 0xed4245)] });
      }
      const tier = interaction.options.getString('tier', true).toUpperCase();
      if (!tiers.has(tier)) return interaction.reply({ content: 'Tier invalide.', ephemeral: true });
      if (!process.env.BOT_API_SECRET) return interaction.reply({ content: 'BOT_API_SECRET manque dans le fichier .env du bot.', ephemeral: true });
      const results = await Promise.all(test.modes.map(async mode => {
        const response = await fetch(`${api}/bot/test-result`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.BOT_API_SECRET}` }, body: JSON.stringify({ username: test.player.minecraftName, mode_id: mode, tier, tester: interaction.user.username }) });
        return { mode, ok: response.ok, body: await response.json().catch(() => ({})) };
      }));
      const failed = results.find(result => !result.ok);
      if (failed) return interaction.reply({ content: failed.body.error || `Impossible de sauvegarder le tier ${failed.mode}.`, ephemeral: true });
      delete config.tests[interaction.channelId]; await save();
      return interaction.reply({ embeds: [worldTiersEmbed('Tier validé', `**${test.player.minecraftName}** obtient **${tier}** en ${test.modes.map(mode => modeLabels[mode]).join(' • ')}.`, 0x57f287)] });
    }
  } catch (error) {
    console.error(error);
    if (interaction.isRepliable() && !interaction.replied) await interaction.reply({ content: 'Erreur du bot. Vérifie ses permissions et réessaie.', ephemeral: true }).catch(() => {});
  }
});

if (!process.env.DISCORD_TOKEN) throw new Error('DISCORD_TOKEN manquant dans .env');
client.login(process.env.DISCORD_TOKEN);
