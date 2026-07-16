import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const commands=[
 new SlashCommandBuilder().setName('rank').setDescription('Voir le rang WorldTiers').addStringOption(o=>o.setName('joueur').setDescription('Pseudo Minecraft').setRequired(true)),
 new SlashCommandBuilder().setName('top').setDescription('Voir le top WorldTiers').addStringOption(o=>o.setName('mode').setDescription('Mode : sword, mace, vanilla…')),
 new SlashCommandBuilder().setName('profil').setDescription('Ouvrir un profil WorldTiers').addStringOption(o=>o.setName('joueur').setDescription('Pseudo Minecraft').setRequired(true)),
 new SlashCommandBuilder().setName('ticket').setDescription('Ouvrir un ticket staff').addStringOption(o=>o.setName('sujet').setDescription('Ta demande').setRequired(true)),
 new SlashCommandBuilder().setName('close').setDescription('Fermer ce ticket'),
 new SlashCommandBuilder().setName('link').setDescription('Lier ton Discord à ton profil Minecraft').addStringOption(o=>o.setName('joueur').setDescription('Pseudo WorldTiers').setRequired(true)),
 new SlashCommandBuilder().setName('testermodes').setDescription('Choisir les modes que tu peux tester').addStringOption(o=>o.setName('modes').setDescription('Ex. sword,mace,crystal').setRequired(true)),
 new SlashCommandBuilder().setName('tierrequest').setDescription('Entrer dans la file pour un test de tier').addStringOption(o=>o.setName('mode').setDescription('Mode à tester').setRequired(true)),
 new SlashCommandBuilder().setName('testaccept').setDescription('Valider un tier dans un salon de test').addStringOption(o=>o.setName('tier').setDescription('HT1, LT1, HT2…').setRequired(true)),
 new SlashCommandBuilder().setName('testreject').setDescription('Refuser ou annuler un test').addStringOption(o=>o.setName('raison').setDescription('Raison').setRequired(true)),
 new SlashCommandBuilder().setName('rolesync').setDescription('Synchroniser ton rôle Testeur avec WorldTiers'),
 new SlashCommandBuilder().setName('setup').setDescription('Configurer le bot').setDefaultMemberPermissions(PermissionFlagsBits.Administrator).addChannelOption(o=>o.setName('annonces').setDescription('Salon mises à jour').setRequired(true)).addChannelOption(o=>o.setName('bienvenue').setDescription('Salon bienvenue')).addChannelOption(o=>o.setName('tickets').setDescription('Catégorie tickets')).addRoleOption(o=>o.setName('staff').setDescription('Rôle staff tickets')),
 new SlashCommandBuilder().setName('testsetup').setDescription('Configurer les tests de tiers').setDefaultMemberPermissions(PermissionFlagsBits.Administrator).addChannelOption(o=>o.setName('file').setDescription('Salon de la file de tests').setRequired(true)).addChannelOption(o=>o.setName('categorie').setDescription('Catégorie des salons privés de test').setRequired(true)).addRoleOption(o=>o.setName('testeurs').setDescription('Rôle Discord des testeurs').setRequired(true)),
 new SlashCommandBuilder().setName('announce').setDescription('Publier une mise à jour').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).addStringOption(o=>o.setName('message').setDescription('Message').setRequired(true)),
 new SlashCommandBuilder().setName('warn').setDescription('Avertir un membre').setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers).addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)).addStringOption(o=>o.setName('raison').setDescription('Raison').setRequired(true)),
 new SlashCommandBuilder().setName('kick').setDescription('Expulser un membre').setDefaultMemberPermissions(PermissionFlagsBits.KickMembers).addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)).addStringOption(o=>o.setName('raison').setDescription('Raison').setRequired(true)),
 new SlashCommandBuilder().setName('ban').setDescription('Bannir un membre').setDefaultMemberPermissions(PermissionFlagsBits.BanMembers).addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)).addStringOption(o=>o.setName('raison').setDescription('Raison').setRequired(true)),
].map(command=>command.toJSON());
