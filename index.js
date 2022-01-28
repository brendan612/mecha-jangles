const { Client, Collection, Intents } = require('discord.js');
const client = new Client({ intents: [ Intents.FLAGS.GUILDS, 
                                        Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
                            partials: [ "CHANNEL", "GUILD_MEMBER", "MESSAGE" , "USER", "REACTION"]});
const Enmap = require('enmap');
const fs = require('fs');
const { join } = require('path');
const VoiceConnectionManager = require("./voiceConnectionManager.js").VoiceConnectionManager;
const VoiceChannelManager = require("./voiceChannelManager.js").VoiceChannelManager;
const ServerSettings = require("./serverSettings.js").ServerSettings;

const { MongoClient } = require('mongodb');
const poll = require('./slash/poll');
const { Audit } = require('./audit');
const mongoclient = new MongoClient(process.env.db, { useNewUrlParser: true, useUnifiedTopology: true });

class MechaJangles {
    constructor(){
        this.commands = new Collection();
        this.events = [];

        this.launch();
    }

    async launch(){
        client.commands = new Collection();
        client.DB = mongoclient;
        client.SpamMap = new Map();
        client.SpamLimit = 5;
        client.SpamDiff = 5000;
        client.ServerSettings = new ServerSettings();
        client.Audit = new Audit(client.ServerSettings.guildID, client.ServerSettings.auditLogsChannelID);
        client.VCM = new VoiceConnectionManager();
        client.VoiceChannelManager = new VoiceChannelManager(client);
        this.loadCommands();
        this.loadHandlers();
        this.listenForCommands();
        this.setPermissions();
    }

    loadHandlers(){
        fs.readdir("./handlers/", (err, files) => {
            if (err) return console.error(err);
            files.forEach(file => {
              const event = require(`./handlers/${file}`);
              let eventName = file.split(".")[0];
              client.on(eventName, event.bind(null, client));
            });
        });

        console.log("Loaded handlers");
    }

    loadCommands(){
        fs.readdir("./slash/", (err, files) => {
            if (err) return console.error(err);
            files.forEach(file => {
              if (!file.endsWith(".js")) return;
              const command = require(`./slash/${file}`);
              client.commands.set(command.data.name, command);
            });
        });
        fs.readdir("./commands/", (err, files) => {
            if (err) return console.error(err);
            files.forEach(file => {
              if (!file.endsWith(".js")) return;
              let props = require(`./commands/${file}`);
              let commandName = file.split(".")[0];
              client.commands.set(commandName, props);
              this.commands.set(commandName,props);
            });
        });
    }

    listenForCommands(){
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        })
        readline.question(``, data => {
            console.log(data);
            let guild = client.guilds.cache.find((guild) => guild.id === "868198840778498068");
            let channel = guild.channels.cache.find((channel) => channel.name === "bot-self-commands");
            channel.send(data);
            readline.close();
            this.listenForCommands();
        });
    }

    async setPermissions(){
        const commands = await client.guilds.cache.get(client.ServerSettings.guildID).commands.fetch();
        
        for(let [key, value] of commands){
            console.log(value.name, value.id);
        }

        const staffPermissions = [
            {
                id: '868276144015835137', //erne
                type: 'ROLE',
                permission: true,
            },
            {
                id: '868276464431292507', //admin
                type: 'ROLE',
                permission: true,
            },
            {
                id: '868276759328608286', //mod
                type: 'ROLE',
                permission: true,
            },
        ];

        /* #region Shutup Permissions */ 

        const shutupCommand = await client.guilds.cache.get(client.ServerSettings.guildID)?.commands.fetch('932374162134147102');

        const shutupPermissions = [
            {
                id: '868276144015835137',
                type: 'ROLE',
                permission: true,
            },
        ];
        
        await shutupCommand.permissions.add({ permissions: shutupPermissions });
        /* #endregion */

        /* #region Poll Permissions */ 
        // const pollCommand = await client.guilds.cache.get(guildId)?.commands.fetch('932374162134147102');

        // await pollCommand.permissions.add({ permissions: staffPermissions });
        /* #endregion */

        /* #region Fart Permissions */ 
        const fartCommand = await client.guilds.cache.get(client.ServerSettings.guildID)?.commands.fetch('932371424830685224');

        await fartCommand.permissions.add({ permissions: staffPermissions });
        /* #endregion */
    }
}

client.on('ready', () => {
    let db = mongoclient;

    db.connect(err => {
        const collection = db.db("mecha-jangles").collection("polls").find({ });
        collection.forEach(function(doc){
            client.guilds.cache.get(client.ServerSettings.guildID).channels.cache.get(doc.channelID).messages.fetch(doc.messageID);
        }); 

    });

    new MechaJangles();

    client.user.setPresence({
        activities: [{ name: "with simulations"}],
        status: 'online'
    });
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


client.login(process.env.token);
