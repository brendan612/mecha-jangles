require('dotenv').config();
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
const { Audit } = require('./audit');
const { Utilities } = require("./utilities");

const dbURI = process.env.dbURI;
const dbName = process.env.dbName;
const botToken = process.env.token;
const clientID = process.env.clientID;
const guildID = process.env.guildID;
    
let mongoclient = new MongoClient(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

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
        client.ServerSettings = new ServerSettings(client, dbName, guildID, clientID);
        client.Audit = new Audit(client.ServerSettings.guildID, client.ServerSettings.auditLogsChannelID);
        client.VCM = new VoiceConnectionManager();
        client.VoiceChannelManager = new VoiceChannelManager(client);
        client.Utilities = new Utilities(client.DB, dbName);
        this.loadCommands();
        this.loadHandlers();
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
    }

    loadCommands(){
        fs.readdir("./commands/", (err, files) => {
            if (err) return console.error(err);
            files.forEach(file => {
              if (!file.endsWith(".js")) return;
              const command = require(`./commands/${file}`);
              client.commands.set(command.data.name, command);
            });
        });
    }
}

client.on('ready', () => {
    let db = mongoclient;

    db.connect(err => {
        db.db(dbName).collection("polls").find({ }).toArray().then(collection => {
            if (collection.length > 0){
                collection.forEach(function(doc){
                    const pollGuild = client.guilds.cache.get(client.ServerSettings.guildID);
                    if (pollGuild !== null && pollGuild !== undefined){
                        const channel = pollGuild.channels.cache.get(doc.channelID);
                        if (channel !== null && channel !== undefined)
                            channel.messages.fetch(doc.messageID);
                    }
                }); 
            }
        });
    });

    new MechaJangles();

    client.user.setPresence({
        activities: [{ name: "you", type: "WATCHING"}],
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

client.on('error', (e) => {
    client.Utilities.LogError(e);
});

client.login(botToken);