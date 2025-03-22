const express = require("express");
const spotifyApi = require("./spotifyAuth");

const app = express();
const PORT = 8888;

// Step 1: Redirect the user to Spotify for authentication
app.get("/login", (req, res) => {
	const scopes = [
		"user-read-playback-state",
		"user-modify-playback-state",
		"user-read-currently-playing",
		"playlist-modify-public",
		"playlist-modify-private",
	];
	const authUrl = spotifyApi.createAuthorizeURL(scopes);
	res.redirect(authUrl);
});

// Step 2: Handle the OAuth callback from Spotify
app.get("/callback", async (req, res) => {
	const code = req.query.code || null;

	if (!code) {
		return res.status(400).send("Authorization code not received.");
	}

	try {
		const data = await spotifyApi.authorizationCodeGrant(code);
		spotifyApi.setAccessToken(data.body.access_token);
		spotifyApi.setRefreshToken(data.body.refresh_token);

		console.log("Access Token:", data.body.access_token);
		console.log("Refresh Token:", data.body.refresh_token);

		res.send("Authorization successful! You can close this page.");
	} catch (error) {
		console.error("Error getting tokens:", error);
		res.status(500).send("Authentication failed.");
	}
});

app.listen(PORT, () =>
	console.log(`Auth server running on http://localhost:${PORT}`)
);
