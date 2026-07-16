import { REST, Routes } from 'discord.js';
import { commands } from './commands.js';
const {DISCORD_TOKEN,DISCORD_CLIENT_ID,DISCORD_GUILD_ID}=process.env;
if(!DISCORD_TOKEN||!DISCORD_CLIENT_ID||!DISCORD_GUILD_ID)throw new Error('Ajoute DISCORD_TOKEN, DISCORD_CLIENT_ID et DISCORD_GUILD_ID dans .env');
await new REST({version:'10'}).setToken(DISCORD_TOKEN).put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID,DISCORD_GUILD_ID),{body:commands});
console.log(`${commands.length} commandes WorldTiers enregistrées.`);
