const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
const moment = require('moment');
const config = require('./config.json');

const prefix = '!!';

client.on("ready", () => {
	console.log("----------------------------------------");
    console.log("         Connecté !         ");
    console.log("https://discord.com/oauth2/authorize?client_id=" + client.user.id + "&permissions=8&scope=bot")
    console.log("----------------------------------------");
    console.log("Pseudo  : " + client.user.username)
    console.log("ID : " + client.user.id)
});

client.on('message', (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'setdouane') {
    if (message.author.id !== config.ownerID) return;
    config.douaneChannelID = args[0];
    message.channel.send(`🛂 Salon de douane configuré : ${config.douaneChannelID}`);
    saveConfig();
  }

  if (command === 'setlogs') {
    if (message.author.id !== config.ownerID) return;
    config.logsChannelID = args[0];
    message.channel.send(`📜 Salon de logs configuré : ${config.logsChannelID}`);
    saveConfig();
  }

  if (command === 'removedouane') {
    if (message.author.id !== config.ownerID) return;
    config.douaneChannelID = null;
    message.channel.send('❌ Douane retirée.');
    saveConfig();
  }

  if (command === 'setuprole') {
    if (!config.douaneChannelID || message.channel.id !== config.douaneChannelID) return;
    const roleName = args.join(' ');
    const role = message.guild.roles.cache.find((r) => r.name === roleName || r.id === roleName.replace(/<@&|>/g, ''));
    if (!role) {
      message.channel.send(`❌ Le rôle ${roleName} n'existe pas.`);
    } else {
      config.verificationRole = role.id;
      message.channel.send(`✅ Rôle configuré : ${role.name}`);
      saveConfig();
    }
  }

if (command === 'whitelist') {
  if (message.author.id !== config.ownerID) return;
  const subcommand = args[0];

  if (subcommand === 'add') {
    const target = message.mentions.users.first() || client.users.cache.get(args[1]);
    if (!target) {
      message.channel.send('❌ Utilisateur non trouvé.');
      return;
    }

    if (config.whitelist.includes(target.id)) {
      message.channel.send(`❌ ${target.tag} est déjà dans la liste blanche.`);
    } else {
      config.whitelist.push(target.id);
      message.channel.send(`✅ ${target.tag} a été ajouté à la liste blanche.`);
      saveConfig();
    }
  } else if (subcommand === 'remove') {
    const target = message.mentions.users.first() || client.users.cache.get(args[1]);
    if (!target) {
      message.channel.send('❌ Utilisateur non trouvé.');
      return;
    }
    const index = config.whitelist.indexOf(target.id);
    if (index !== -1) {
      config.whitelist.splice(index, 1);
      message.channel.send(`✅ ${target.tag} a été retiré de la liste blanche.`);
      saveConfig();
    } else {
      message.channel.send(`❌ ${target.tag} n'est pas dans la liste blanche.`);
    }
  } else if (subcommand === 'list') {
    const whitelistMembers = config.whitelist.map((id) => {
      const user = client.users.cache.get(id);
      return user ? user.tag : `Utilisateur inconnu (${id})`;
    });
    const listMessage = whitelistMembers.length ? whitelistMembers.join('\n') : 'Liste blanche vide.';
    message.channel.send(`Liste blanche des membres :
    \`\`\`
    ${listMessage}
    \`\`\`
    `);
  }
}

  if (command === 'help') {
    const helpMessage = `
    Commandes disponibles :
    - !setdouane <channel ID> : Configurer le salon de douane.
    - !setlogs <id ou mention salon> : Configurer le salon de logs.
    - !removedouane : Retirer la douane.
    - !setuprole <role> : Configurer le rôle de vérification.
    - !whitelist add <id ou mention> : Ajouter un utilisateur à la liste blanche.
    - !whitelist remove <id ou mention> : Retirer un utilisateur de la liste blanche.
    - !whitelist list : Afficher la liste blanche des membres.
    `;
    message.channel.send(helpMessage);
  }
});

client.on('guildMemberAdd', async (member) => {
  try {
    if (!config.douaneChannelID) return;

    const douaneChannel = member.guild.channels.cache.get(config.douaneChannelID);

    if (!douaneChannel) return;

    const userAvatarURL = member.user.displayAvatarURL(); // Récupérer l'URL de la photo de profil de l'utilisateur

    const embed = new Discord.MessageEmbed()
      .setTitle('Vérification de membre')
      .setColor('#ff0000')
      .setThumbnail(member.user.displayAvatarURL())
      .addField('Mention', member.user.toString())
      .addField('ID', member.user.id)
      .addField('Date de création du compte', moment(member.user.createdAt).format('LL LTS')) // Formatage en français
      .addField('Date de join du serveur', moment(member.joinedAt).format('LL LTS')) // Formatage en français
      .setFooter('Réagissez avec ✅ pour accepter, ❌ pour refuser, ou 🔨 pour bannir ce membre.');

    const message = await douaneChannel.send(embed);

    message.react('✅');
    message.react('❌');
    message.react('🔨');

    const filter = (reaction, user) => ['✅', '❌', '🔨'].includes(reaction.emoji.name) && config.whitelist.includes(user.id);

    const collector = message.createReactionCollector(filter);

    collector.on('collect', async (reaction, user) => {
      try {
        if (reaction.emoji.name === '✅') {
          const roleID = config.verificationRole;
          const role = member.guild.roles.cache.get(roleID);
          if (role) {
            await member.roles.add(role);
            const logsChannel = member.guild.channels.cache.get(config.logsChannelID);
            if (logsChannel) {
              const acceptEmbed = new Discord.MessageEmbed()
                .setColor('#00ff00')
				.setThumbnail(userAvatarURL)
                .setDescription(`✅ ${member.user.toString()} (${member.user.id}) a été accepté par ${user.toString()} (${user.id})`);
              await logsChannel.send(acceptEmbed);
            }
            await member.send('✅ Vous avez été accepté sur le serveur.');
          } else {
            await douaneChannel.send(`Le rôle de vérification n'est pas configuré.`);
          }
        } else if (reaction.emoji.name === '❌') {
          await member.send('❌ Votre demande de vérification a été refusée.');
          await member.kick('Demande de vérification refusée');
          const logsChannel = member.guild.channels.cache.get(config.logsChannelID);
          if (logsChannel) {
            const refuseEmbed = new Discord.MessageEmbed()
              .setColor('#ff0000')
		      .setThumbnail(userAvatarURL)
              .setDescription(`❌ ${member.user.toString()} (${member.user.id}) a été refusé par ${user.toString()} (${user.id})`);
            await logsChannel.send(refuseEmbed);
		  }
        } else if (reaction.emoji.name === '🔨') {
          // Bannir l'utilisateur
		await member.ban({ reason: 'Demande de vérification refusée' });
		const logsChannel = member.guild.channels.cache.get(config.logsChannelID);
		if (logsChannel) {
		  const banEmbed = new Discord.MessageEmbed()
			.setColor('#ff0000')
			.setThumbnail(userAvatarURL) // Ajouter la photo de profil de l'utilisateur dans les logs
			.setDescription(`🔨 ${member.user.toString()} (${member.user.id}) a été banni par ${user.toString()} (${user.id})`);
			
		  await logsChannel.send(banEmbed);
		}
        }
        await message.delete();
      } catch (error) {
        console.error('Erreur lors de la gestion de la réaction :', error);
      }
    });

    collector.on('end', () => {
      if (!message.deleted) {
        message.delete();
      }
    });

    // Envoi des informations dans le salon de logs
    if (config.logsChannelID) {
      const logsChannel = member.guild.channels.cache.get(config.logsChannelID);

      if (logsChannel) {
        const logEmbed = new Discord.MessageEmbed()
          .setTitle('Membre Rejoint')
          .setColor('#00ff00')
          .setDescription(`${member.user.toString()} a rejoint le serveur.`)
          .setThumbnail(userAvatarURL); // Ajouter la photo de profil de l'utilisateur dans les logs

        await logsChannel.send(logEmbed);
      }
    }
  } catch (error) {
    console.error('Erreur lors de la gestion de l\'arrivée du membre :', error);
  }
});

client.on('guildMemberRemove', async (member) => {
  try {
    if (!config.logsChannelID) return;

    const logsChannel = member.guild.channels.cache.get(config.logsChannelID);

    if (!logsChannel) return;

    // Supprime le message de vérification associé à ce membre s'il existe
    const verificationMessages = await logsChannel.messages.fetch({ limit: 100 });
    const verificationMessage = verificationMessages.find(message => {
      const embed = message.embeds[0];
      if (embed && embed.title === 'Vérification de membre' && embed.fields[1].value === member.user.id) {
        return true;
      }
      return false;
    });
    
    if (verificationMessage) {
      verificationMessage.delete();
    }

    const userAvatarURL = member.user.displayAvatarURL();

    const embed = new Discord.MessageEmbed()
      .setTitle('Membre Quitte le Serveur')
      .setColor('#ff0000')
      .setThumbnail(userAvatarURL)
      .addField('Mention', member.user.toString())
      .addField('ID', member.user.id)
      .addField('Date de création du compte', moment(member.user.createdAt).format('LL LTS')) // Formatage en français
      .setFooter('Membre a quitté le serveur.');

    await logsChannel.send(embed);

  } catch (error) {
    console.error('Erreur lors de la gestion du départ du membre :', error);
  }
});


function saveConfig() {
  fs.writeFile('./config.json', JSON.stringify(config, null, 2), (err) => {
    if (err) {
      console.error('Erreur lors de la sauvegarde de la configuration :', err);
    } else {
      console.log('Configuration sauvegardée avec succès.');
    }
  });
}

client.login(config.token);