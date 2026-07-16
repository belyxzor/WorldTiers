import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const commands=[
 new SlashCommandBuilder().setName('rank').setDescription('Voir le rang WorldTiers').addStringOption(o=>o.setName('joueur').setDescription('Pseudo Minecraft').setRequired(true)),
 new SlashCommandBuilder().setName('top').setDescription('Voir le top WorldTiers').addStringOption(o=>o.setName('mode').setDescription('Mode : sword, mace, vanilla…')),
 new SlashCommandBuilder().setName('profil').setDescription('Ouvrir un profil WorldTiers').addStringOption(o=>o.setName('joueur').setDescription('Pseudo Minecraft').setRequired(true)),
 new SlashCommandBuilder().setName('ticket').setDescription('Ouvrir un ticket staff').addStringOption(o=>o.setName('sujet').setDescription('Ta demande').setRequired(true)),
 new SlashCommandBuilder().setName('close').setDescription('Fermer ce ticket'),
 new SlashCommandBuilder().setName('setup').setDescription('Configurer le bot').setDefaultMemberPermissions(PermissionFlagsBits.Administrator).addChannelOption(o=>o.setName('annonces').setDescription('Salon mises à jour').setRequired(true)).addChannelOption(o=>o.setName('bienvenue').setDescription('Salon bienvenue')).addChannelOption(o=>o.setName('tickets').setDescription('Catégorie tickets')).addRoleOption(o=>o.setName('staff').setDescription('Rôle staff tickets')),
 new SlashCommandBuilder().setName('announce').setDescription('Publier une mise à jour').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).addStringOption(o=>o.setName('message').setDescription('Message').setRequired(true)),
 new SlashCommandBuilder().setName('warn').setDescription('Avertir un membre').setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers).addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)).addStringOption(o=>o.setName('raison').setDescription('Raison').setRequired(true)),
 new SlashCommandBuilder().setName('kick').setDescription('Expulser un membre').setDefaultMemberPermissions(PermissionFlagsBits.KickMembers).addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)).addStringOption(o=>o.setName('raison').setDescription('Raison').setRequired(true)),
 new SlashCommandBuilder().setName('ban').setDescription('Bannir un membre').setDefaultMemberPermissions(PermissionFlagsBits.BanMembers).addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)).addStringOption(o=>o.setName('raison').setDescription('Raison').setRequired(true)),
].map(command=>command.toJSON());
