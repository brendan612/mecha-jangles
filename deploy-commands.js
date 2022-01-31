require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

const dbURI = process.env.dbURI;
const db = process.env.db;
const botToken = process.env.token;
const clientID = process.env.clientID;
const guildID = process.env.guildID;

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	console.log(file);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(botToken);
rest.put(Routes.applicationGuildCommands(clientID, guildID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);