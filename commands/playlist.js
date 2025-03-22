const { SlashCommandBuilder } = require("@discordjs/builders");
const { v4: uuidv4 } = require("uuid"); // Generate UUIDs

module.exports = {
	data: new SlashCommandBuilder()
		.setName("playlist")
		.setDescription("Show a spotify playlist")
		.addStringOption((option) =>
			option
				.setName("playlist")
				.setDescription("Spotify URL")
				.setRequired(false)
				.setAutocomplete(true)
		),
	async execute(interaction) {
		let playlistID = interaction.options.getString("playlist");
		if (!playlistID) playlistID = "0Phm8OUlHsJ5B3Cy8ZFhtD";
		const playlist = await interaction.client.spotifyApi.getPlaylist(
			playlistID
		);

		if (playlist) interaction.reply(playlist.body.external_urls.spotify);
		else interaction.reply("Playlist not found!");
	},
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused(true);
		if (focusedValue.name === "playlist") {
			const { data, error } = await interaction.client.db.supabase
				.from("playlists")
				.select("playlist_id, playlist_name");

			if (error) {
				console.log(error);
				await interaction.respond([]);
				return;
			}

			const choices = data
				.map((row) => ({
					name: row.playlist_name || row.playlist_id,
					value: row.playlist_id,
				}))
				.slice(0, 25);

			await interaction.respond(choices);
		}
	},
};
