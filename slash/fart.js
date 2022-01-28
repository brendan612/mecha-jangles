const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fart')
		.setDescription('Unleash hell')
        .setDefaultPermission(false)
        .addMentionableOption(option => option.setName("victim").setDescription("Your victim").setRequired(true)),
	async execute(interaction) {

        let victim = interaction.options.getMentionable('victim');

        if (victim.voice){
            await interaction.client.VCM.PlaySound(victim.voice.channel.id, interaction.guild.id, interaction.guild.voiceAdapterCreator, './funny_sound.mp3 ');
            await interaction.reply({ content: `${victim.nickname || victim.displayName} has received a fart`, ephemeral: true });
        }
    },
};