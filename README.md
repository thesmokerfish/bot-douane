# Discord Bot - Douane 🚨

Ce bot Discord permet de gérer un système de vérification et de contrôle pour les nouveaux membres rejoignant un serveur Discord. Il propose des fonctionnalités de configuration avancées pour personnaliser les salons, les rôles et les listes de contrôle d'accès.

## Fonctionnalités principales

- Configuration d'un **salon de douane** pour vérifier les nouveaux membres.
- Configuration d'un **salon de logs** pour suivre les actions du bot.
- Système de vérification avec des rôles attribués aux utilisateurs acceptés.
- Système de **liste blanche** pour les utilisateurs autorisés à gérer les nouveaux membres.
- Commandes pour configurer et administrer le bot.
- Notifications et logs en temps réel lors des arrivées et des départs des membres.

## Prérequis

- [Node.js](https://nodejs.org/) version 16 ou supérieure.
- Une application Discord avec un **token de bot** (voir [créer un bot Discord](https://discord.com/developers/applications)).

## Installation

1. Clonez ce dépôt :

   ```bash
   git clone <URL_du_dépôt>
   cd <nom_du_dépôt>
   ```

2. Installez les dépendances :

   ```bash
   npm install
   ```

3. Créez un fichier `config.json` dans le répertoire principal avec le contenu suivant :

   ```json
   {
     "token": "VOTRE_TOKEN",
     "ownerID": "VOTRE_ID_DISCORD",
     "douaneChannelID": null,
     "logsChannelID": null,
     "verificationRole": null,
     "whitelist": []
   }
   ```

4. Lancez le bot :

   ```bash
   node index.js
   ```

## Commandes disponibles

| Commande                          | Description                                        |
|-----------------------------------|----------------------------------------------------|
| `!!setdouane <channel ID>`        | Configure le salon de douane.                     |
| `!!setlogs <channel ID>`          | Configure le salon de logs.                       |
| `!!removedouane`                  | Retire le salon de douane.                        |
| `!!setuprole <nom/id>`            | Configure le rôle de vérification.                |
| `!!whitelist add <id/mention>`    | Ajoute un utilisateur à la liste blanche.         |
| `!!whitelist remove <id/mention>` | Retire un utilisateur de la liste blanche.        |
| `!!whitelist list`                | Affiche la liste blanche.                         |
| `!!help`                          | Affiche l'aide avec toutes les commandes.         |

## Fonctionnement du système de vérification

1. Lorsqu'un nouveau membre rejoint le serveur, un message d'embême avec des réactions (✅, ❌, 🔨) est envoyé dans le salon de douane.
2. Les utilisateurs autorisés (présents dans la liste blanche) peuvent :
   - ✅ **Accepter** : Ajoute le rôle de vérification au membre.
   - ❌ **Refuser** : Exclut le membre du serveur.
   - 🔨 **Bannir** : Bannit le membre du serveur.

## Configuration supplémentaire

- **Logs personnalisés** : Tous les événements (arrivées, départs, actions) sont enregistrés dans le salon de logs configuré.
- **Gestion dynamique** : Les paramètres peuvent être modifiés à tout moment grâce aux commandes.

## Exemple de configuration

1. Configurez le salon de douane :
   ```
   !!setdouane 123456789012345678
   ```
2. Configurez le salon de logs :
   ```
   !!setlogs 234567890123456789
   ```
3. Ajoutez un utilisateur à la liste blanche :
   ```
   !!whitelist add @Utilisateur
   ```

## Contributions

Les contributions sont les bienvenues ! Veuillez ouvrir une **issue** ou soumettre une **pull request** pour toute modification ou fonctionnalité supplémentaire.

## License

Ce projet est sous licence [MIT](LICENSE).

