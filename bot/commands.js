import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

const modes = [
  ['crystal', 'Vanilla'], ['sword', 'Sword'], ['uhc', 'UHC'], ['nethpot', 'Neth Pot'], ['pot', 'Pot'],
  ['smp', 'SMP'], ['axe', 'Axe'], ['diasmp', 'Dia SMP'], ['mace', 'Mace'], ['spear-mace', 'Spear Mace'],
];
const tierChoices = ['HT1', 'LT1', 'HT2', 'LT2', 'HT3', 'LT3', 'HT4', 'LT4', 'HT5', 'LT5'];
const member = option => option.setName('membre').setDescription('Membre Discord').setRequired(true);

export const commands = [
  new SlashCommandBuilder().setName('setup').setDescription('Configurer le bot WorldTiers').setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption(option => option.setName('testeurs').setDescription('Role des testeurs').setRequired(true))
    .addChannelOption(option => option.setName('categorie_tests').setDescription('Categorie des salons de test'))
    .addChannelOption(option => option.setName('categorie_tickets').setDescription('Categorie des tickets'))
    .addRoleOption(option => option.setName('staff').setDescription('Role staff des tickets'))
    .addChannelOption(option => option.setName('reports').setDescription('Salon des reports')),
  new SlashCommandBuilder().setName('profil').setDescription('Voir le profil WorldTiers').addStringOption(option => option.setName('name').setDescription('Pseudo Minecraft').setRequired(true)),
  new SlashCommandBuilder().setName('tier').setDescription('Voir les tiers WorldTiers d un joueur').addStringOption(option => option.setName('name').setDescription('Pseudo Minecraft').setRequired(true)),
  new SlashCommandBuilder().setName('top').setDescription('Voir le classement WorldTiers').addStringOption(option => option.setName('mode').setDescription('Mode, sinon classement global').addChoices(...modes.map(([value, name]) => ({ name, value })))),
  new SlashCommandBuilder().setName('site').setDescription('Ouvrir le site WorldTiers'),
  new SlashCommandBuilder().setName('web').setDescription('Ouvrir le site WorldTiers'),
  new SlashCommandBuilder().setName('vanilla').setDescription('Ouvrir le classement Vanilla'),
  ...modes.map(([mode, label]) => new SlashCommandBuilder().setName(mode).setDescription(`Ouvrir le classement ${label}`).toJSON()),
  new SlashCommandBuilder().setName('tierfille').setDescription('Creer une file d attente de test').addStringOption(option => option.setName('modes').setDescription('Exemple : mace,sword').setRequired(true)).addRoleOption(option => option.setName('role_ping').setDescription('Role a mentionner lors de la creation')),
  new SlashCommandBuilder().setName('tieraccept').setDescription('Valider le tier dans un salon de test').addStringOption(option => option.setName('tier').setDescription('Tier valide').setRequired(true).addChoices(...tierChoices.map(tier => ({ name: tier, value: tier })))),
  new SlashCommandBuilder().setName('tierrefuse').setDescription('Refuser ou annuler le test').addStringOption(option => option.setName('raison').setDescription('Raison').setRequired(true)),
  new SlashCommandBuilder().setName('ticket').setDescription('Gerer les tickets')
    .addSubcommand(sub => sub.setName('create').setDescription('Creer un ticket').addStringOption(option => option.setName('sujet').setDescription('Sujet du ticket').setRequired(true)))
    .addSubcommand(sub => sub.setName('add').setDescription('Ajouter une personne au ticket').addUserOption(member))
    .addSubcommand(sub => sub.setName('kick').setDescription('Retirer une personne du ticket').addUserOption(member))
    .addSubcommand(sub => sub.setName('ferme').setDescription('Fermer le ticket actuel')),
  new SlashCommandBuilder().setName('reporte').setDescription('Signaler un membre au staff').addUserOption(member).addStringOption(option => option.setName('raison').setDescription('Raison du report').setRequired(true)),
  new SlashCommandBuilder().setName('ban').setDescription('Bannir un membre').setDefaultMemberPermissions(PermissionFlagsBits.BanMembers).addUserOption(member).addStringOption(option => option.setName('raison').setDescription('Raison').setRequired(true)),
  new SlashCommandBuilder().setName('kick').setDescription('Expulser un membre').setDefaultMemberPermissions(PermissionFlagsBits.KickMembers).addUserOption(member).addStringOption(option => option.setName('raison').setDescription('Raison').setRequired(true)),
  new SlashCommandBuilder().setName('mute').setDescription('Rendre un membre muet temporairement').setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers).addUserOption(member).addIntegerOption(option => option.setName('minutes').setDescription('Duree en minutes, maximum 10080').setRequired(true).setMinValue(1).setMaxValue(10080)).addStringOption(option => option.setName('raison').setDescription('Raison').setRequired(true)),
].map(command => typeof command.toJSON === 'function' ? command.toJSON() : command);
