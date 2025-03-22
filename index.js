require("dotenv").config();
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessagePolls,
		GatewayIntentBits.GuildMembers,
	],
	partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "USER", "REACTION"],
});
const Enmap = require("enmap");
const fs = require("fs");
const { join } = require("path");
const ServerSettings = require("./serverSettings.js").ServerSettings;

const { Audit } = require("./audit");
const { Utilities } = require("./utilities");
const SpotifyWebApi = require("spotify-web-api-node");
const express = require("express");
const spotifyApi = require("./spotifyAuth");
const Database = require("./db.js");

const botToken = process.env.token;
const clientID = process.env.clientID;
const guildID = process.env.guildID;
const defaultRole = process.env.defaultRole;

const app = express();
const PORT = 8888;
const TOKEN_FILE = "spotify_tokens.json";

// Helper function to save tokens to a file
function saveTokens(accessToken, refreshToken) {
	fs.writeFileSync(
		TOKEN_FILE,
		JSON.stringify({ accessToken, refreshToken }),
		"utf8"
	);
}

// Load tokens from file (if they exist)
function loadTokens() {
	try {
		if (fs.existsSync(TOKEN_FILE)) {
			const data = fs.readFileSync(TOKEN_FILE, "utf8");
			if (data.trim().length === 0) throw new Error("Token file is empty"); // Check for empty file
			const tokens = JSON.parse(data);
			if (!tokens.accessToken || !tokens.refreshToken)
				throw new Error("Token data missing");
			return tokens;
		}
	} catch (err) {
		console.error("Error loading tokens:", err);
		return null; // Return null if tokens can't be loaded
	}
	return null;
}

// Step 1: Redirect user to Spotify for authentication
app.get("/login", (req, res) => {
	const scopes = ["playlist-modify-public", "playlist-modify-private"];
	const authUrl = spotifyApi.createAuthorizeURL(scopes);
	res.redirect(authUrl);
});

// Step 2: Handle OAuth callback
app.get("/callback", async (req, res) => {
	const code = req.query.code || null;

	if (!code) {
		return res.status(400).send("Authorization code not received.");
	}

	try {
		const data = await spotifyApi.authorizationCodeGrant(code);
		spotifyApi.setAccessToken(data.body.access_token);
		spotifyApi.setRefreshToken(data.body.refresh_token);

		// Save tokens for future use
		saveTokens(data.body.access_token, data.body.refresh_token);

		console.log("Spotify authentication successful!");
		res.send("Authorization successful! You can close this page.");
	} catch (error) {
		console.error("Error getting tokens:", error);
		res.status(500).send("Authentication failed.");
	}
});

// Start Express server
app.listen(PORT, () => {
	console.log(`Auth server running on http://localhost:${PORT}/login`);
	loadTokens(); // Load tokens when the server starts
});

class ParisBot {
	constructor() {
		this.commands = new Collection();
		this.events = [];

		this.launch();
	}

	async launch() {
		client.commands = new Collection();

		client.db = new Database();

		client.SpamMap = new Map();
		client.SpamLimit = 5;
		client.SpamDiff = 5000;
		client.spotifyApi = spotifyApi;
		this.loadCommands();
		this.loadHandlers();
	}

	loadHandlers() {
		fs.readdir("./handlers/", (err, files) => {
			if (err) return console.error(err);
			files.forEach((file) => {
				const event = require(`./handlers/${file}`);
				let eventName = file.split(".")[0];
				client.on(eventName, event.bind(null, client));
			});
		});
	}

	loadCommands() {
		fs.readdir("./commands/", (err, files) => {
			if (err) return console.error(err);
			files.forEach((file) => {
				if (!file.endsWith(".js")) return;
				const command = require(`./commands/${file}`);
				client.commands.set(command.data.name, command);
			});
		});
	}
}

client.on("ready", () => {
	new ParisBot();

	client.user.setPresence({
		activities: [{ name: "the_funny_sound.mp3", type: "PLAYING" }],
		status: "online",
	});

	// Configure Spotify API
	const spotifyApi = new SpotifyWebApi({
		clientId: process.env.SPOTIFY_CLIENT_ID,
		clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
		redirectUri: process.env.SPOTIFY_REDIRECT_URI,
	});

	// const scopes = ["playlist-modify-public", "playlist-modify-private"];
	// const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
	// console.log(authorizeURL);

	// spotifyApi
	// 	.authorizationCodeGrant(
	// 		"AQCCMmiYVf9QhTiZBl9_zVGXjIk-DAdvMMma_Noo4P41vwQLxEbOG_VDuC97zRGlxwcY4kQPE4uTDltiRLTxnJPoDn1h5-ZeXyWPVTU82e8icLP4TP5jQeDrAq4yFQfFG_9RtGhYk9JgPbWCW9YdZugb0qGNzwwQrjGRZFx3w5AnDJAhOESi1tgCOFomdltNDWHEjFAS4MQqAdYJmE78sNAsdTCdSJoWe9v465zg8A"
	// 	)
	// 	.then(function (data) {
	// 		spotifyApi.setAccessToken(data.body["access_token"]);
	// 		spotifyApi.setRefreshToken(data.body["refresh_token"]);
	// 	});

	// // // Helper: Refresh Spotify Access Token
	// async function refreshSpotifyAccessToken() {
	// 	try {
	// 		const data = await spotifyApi.refreshAccessToken();
	// 		const accessToken = data.body.access_token;
	// 		spotifyApi.setAccessToken(accessToken);
	// 		console.log("Spotify access token refreshed");
	// 	} catch (error) {
	// 		console.error("Error refreshing Spotify token:", error);
	// 	}
	// }

	// setInterval(refreshSpotifyAccessToken, 55 * 60 * 1000);

	// client.spotify = spotifyApi;
});

client.on("interactionCreate", async (interaction) => {
	try {
		if (interaction.isAutocomplete()) {
			const command = client.commands.get(interaction.commandName);
			if (command && command.autocomplete) {
				await command.autocomplete(interaction);
				return;
			}
		}

		if (!interaction.isCommand()) return;

		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: "There was an error while executing this command!",
			ephemeral: true,
		});
	}
});

client.on("error", (e) => {});

client.login(botToken);
