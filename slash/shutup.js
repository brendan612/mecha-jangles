const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shutup')
		.setDescription('Kick someone from voice with style')
        .setDefaultPermission(false)
        .addMentionableOption(option => option.setName("user").setDescription("User to kick").setRequired(true)),

	async execute(interaction) {

        let user = interaction.options.getMentionable('user');

        if (user.voice){
            await interaction.client.VCM.PlaySound(user.voice.channel.id, interaction.guild.id, interaction.guild.voiceAdapterCreator, './assets/sounds/shutup.mp3 ', 0, false, async function(){
                interaction.guild.members.fetch(user).then(member => {
                    member.voice.setChannel(null);
                });
                await interaction.reply({ content: `${user.nickname || user.displayName} has been kicked`, ephemeral: true });
            });
        }
    },
};