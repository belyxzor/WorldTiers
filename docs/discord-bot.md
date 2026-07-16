# Bot Discord WorldTiers

Le bot apporte les commandes de classement, les tickets privés, les annonces, l'accueil et la modération.

## Créer le bot Discord

1. Va sur <https://discord.com/developers/applications> et crée une application.
2. Dans **Bot**, crée le bot et copie son token. Ne le montre jamais à personne.
3. Active **Server Members Intent** dans la page Bot.
4. Dans **OAuth2 > URL Generator**, sélectionne `bot` et `applications.commands`.
5. Donne au bot les permissions : View Channels, Send Messages, Embed Links, Manage Channels, Kick Members, Ban Members et Moderate Members.
6. Ouvre le lien généré pour inviter le bot sur ton serveur.

## Variables nécessaires

Dans le `.env` du bot, ajoute :

```env
DISCORD_TOKEN=token-du-bot
DISCORD_CLIENT_ID=id-de-l-application
DISCORD_GUILD_ID=id-du-serveur-discord
WORLDTIERS_API_URL=https://worldtiers.ddns.net/api
BOT_API_SECRET=un-long-secret-identique-au-site
```

Mets aussi `BOT_API_SECRET` avec exactement la même valeur dans les variables d'environnement de l'application WorldTiers. Il permet à `/announce` de publier une annonce sur le site.

## Lancer

```bash
npm install
npm run bot:register
npm run bot
```

Le bot doit rester lancé en permanence, idéalement comme une deuxième application Node.js dans Plesk. Il ne faut pas le lancer dans la même application que `server.js`.

## Commandes

- `/setup` : configure salons d'annonces, bienvenue, catégorie tickets et rôle staff.
- `/testconfig` : admin uniquement, configure la file d'attente, la catégorie des salons privés et le rôle Discord Testeur.
- `/testsetup file:#salon mode:sword joueur:@joueur` : un testeur ajoute directement un joueur dans une file donnée.
- `/link <pseudo>` : génère un code temporaire. Le joueur doit confirmer dans Minecraft avec `/worldtiers link CODE` : personne ne peut donc lier le compte d’un autre joueur.
- `/testermodes <modes>` : un testeur choisit les modes qu'il peut prendre.
- `/tierrequest <mode>` : un joueur entre dans la file d'attente. Le testeur clique ensuite sur **Prendre le test** : un salon privé est créé automatiquement.
- `/testaccept <tier>` et `/testreject <raison>` : finalisent le test. Une validation ajoute le tier et son historique sur le site.
- `/rolesync` : synchronise le rôle Testeur Discord avec le profil WorldTiers lié. La synchronisation automatique tourne également toutes les deux minutes.
- `/rank <joueur>`, `/profil <joueur>`, `/top [mode]` : données réelles de l'API WorldTiers.
- `/ticket <sujet>` et `/close` : tickets privés.
- `/announce <message>` : publication dans Discord et vers l'API du site.
- `/warn`, `/kick`, `/ban` : modération, protégée par permissions Discord.
