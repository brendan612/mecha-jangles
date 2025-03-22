require("dotenv").config();
const SpotifyWebApi = require("spotify-web-api-node");
const fs = require("fs");
const TOKEN_FILE = "spotify_tokens.json";

const spotifyApi = new SpotifyWebApi({
	clientId: process.env.SPOTIFY_CLIENT_ID,
	clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
	redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// Load saved tokens at startup
function loadTokens() {
	try {
		if (fs.existsSync(TOKEN_FILE)) {
			const data = fs.readFileSync(TOKEN_FILE, "utf8");
			if (data.trim().length === 0) throw new Error("Token file is empty");
			const tokens = JSON.parse(data);
			if (!tokens.accessToken || !tokens.refreshToken)
				throw new Error("Token data missing");

			spotifyApi.setAccessToken(tokens.accessToken);
			spotifyApi.setRefreshToken(tokens.refreshToken);

			console.log("Loaded saved Spotify tokens.");
		}
	} catch (err) {
		console.error("Error loading tokens:", err);
	}
}

// Function to save tokens
function saveTokens(accessToken, refreshToken) {
	try {
		fs.writeFileSync(
			TOKEN_FILE,
			JSON.stringify({ accessToken, refreshToken }, null, 2),
			"utf8"
		);
		console.log("Tokens saved successfully.");
	} catch (err) {
		console.error("Error saving tokens:", err);
	}
}

// Function to refresh access token
async function refreshAccessToken() {
	try {
		const data = await spotifyApi.refreshAccessToken();
		const newAccessToken = data.body.access_token;

		spotifyApi.setAccessToken(newAccessToken);
		saveTokens(newAccessToken, spotifyApi.getRefreshToken()); // Save new access token

		console.log("Spotify token refreshed.");
	} catch (err) {
		console.error("Error refreshing token:", err);
	}
}

// Refresh token every 55 minutes
setInterval(refreshAccessToken, 55 * 60 * 1000);

loadTokens(); // Load tokens when the bot starts

module.exports = spotifyApi;
