import { readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const file = new URL('../data/worldtiers.json', import.meta.url);
const count = 5000;
const modes = ['crystal', 'sword', 'uhc', 'nethpot', 'pot', 'smp', 'axe', 'diasmp', 'mace', 'spear-mace'];
const tiers = ['HT1', 'LT1', 'HT2', 'LT2', 'HT3', 'LT3', 'HT4', 'LT4', 'HT5', 'LT5'];
const regions = ['EU', 'NA', 'AS', 'SA'];
const points = { HT1: 60, LT1: 45, HT2: 30, LT2: 20, HT3: 10, LT3: 6, HT4: 4, LT4: 3, HT5: 2, LT5: 1 };

const database = JSON.parse(await readFile(file, 'utf8'));
database.players = database.players.filter((player) => !player.demo);

for (let index = 1; index <= count; index += 1) {
  const assigned = {};
  for (let offset = 0; offset < 1 + (index % 4); offset += 1) {
    const mode = modes[(index * 7 + offset * 3) % modes.length];
    assigned[mode] = tiers[(index * 11 + offset * 5) % tiers.length];
  }
  database.players.push({
    id: randomUUID(), username: `TestPlayer${String(index).padStart(4, '0')}`,
    minecraft_uuid: randomUUID().replaceAll('-', ''), region: regions[index % regions.length],
    retired: index % 37 === 0, demo: true,
    points: Object.values(assigned).reduce((total, tier) => total + points[tier], 0),
    created_at: new Date(Date.UTC(2026, 0, 1 + (index % 180))).toISOString(), tiers: assigned, history: [],
  });
}
await writeFile(file, `${JSON.stringify(database, null, 2)}\n`);
console.log(`${count} profils de démonstration créés.`);
