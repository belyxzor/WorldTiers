# WorldTiers Minecraft Mod

Mod client Fabric pour Minecraft 1.21.11.

## Installation

Copie `release/worldtiersmod-1.21.11.jar` dans le dossier `mods` de Minecraft avec Fabric API.

## Liaison Discord sécurisée

1. Dans Discord : `/link PseudoMinecraft`
2. Le bot fournit un code temporaire.
3. En jeu : `/worldtiers link CODE`

Si le compte n'est pas lié, le mod affiche un rappel à la connexion à un monde ou un serveur.

## Développement

```powershell
cd minecraft-mod
.\gradlew.bat runClient
```

Le JAR se reconstruit avec :

```powershell
.\gradlew.bat build
```
