import { readFile, writeFile } from 'node:fs/promises';

const file = new URL('../data/worldtiers.json', import.meta.url);
const database = JSON.parse(await readFile(file, 'utf8'));
const before = database.players.length;
database.players = database.players.filter((player) => !player.demo);
await writeFile(file, `${JSON.stringify(database, null, 2)}\n`);
console.log(`${before - database.players.length} profils de démonstration supprimés.`);
