const { SlashCommandBuilder } = require("@discordjs/builders");
const { v4: uuidv4 } = require("uuid"); // Generate UUIDs
const axios = require("axios");
const jwt = require("jsonwebtoken");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("add-song")
		.setDescription("Add a song to a spotify playlist")
		.addStringOption((option) =>
			option.setName("url").setDescription("Spotify URL").setRequired(true)
		),
	async execute(interaction) {
		const secret = process.env.JWT_SECRET;

		const payload = {
			id: interaction.user.id,
			username: interaction.user.username,
		};
		const token = jwt.sign(payload, secret, {
			expiresIn: "1h", // Token expiration time
			issuer: "paris-bot",
		});

		const response = await axios.get("http://localhost:5159/api/users", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		console.log(response.data);

		return;
		let url = interaction.options.getString("url");

		const trackID = url.substring(url.indexOf("track/") + 6, url.indexOf("?"));

		const playlistID = "0Phm8OUlHsJ5B3Cy8ZFhtD";
		await interaction.client.spotifyApi.addTracksToPlaylist(playlistID, [
			"spotify:track:" + trackID,
		]);

		const { data, error } = await interaction.client.db.supabase
			.from("playlist_songs")
			.insert([
				{
					playlist_id: playlistID,
					song_id: trackID,
					created_at: new Date().toISOString(), // Auto timestamp
					modified_at: new Date().toISOString(), // Updated timestamp
					added_by: interaction.user.id.toString(), // Discord Snowflake (use BigInt)
				},
			]);

		console.log(data, error);
		interaction.reply("added song!!!!!");
	},
};
