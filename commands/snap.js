const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('snap')
		.setDescription('Balance the scales')
        .setDefaultPermission(false),
	async execute(interaction) {
        const member = interaction.member;
        const guild = interaction.guild;

        if (member.voice.channelID === null){
            await interaction.reply({ content: "You need to be in a voice channel to use this command", ephemeral: true });
        }
        if (member.voice.channelID !== null){
            let snapChannel = member.voice.channel;
            let memberCount = snapChannel.members.size;

            let kickedMembers = [];
            let members = [];
            snapChannel.members.forEach(x => members.push(x));

            for (let i = 0; i < snapChannel.members.size; i++){
                if (memberCount <= (snapChannel.members.size / 2)){
                    break;
                }
    
                let index = Math.floor(Math.random()*memberCount);
                while(kickedMembers.includes(members[index])){
                    index = Math.floor(Math.random()*memberCount);
                }
                var toKick = members[index];
                kickedMembers.push(toKick);
                memberCount--;
            }

            interaction.client.VCM.PlaySound(snapChannel.id, guild.id, guild.voiceAdapterCreator, '../bot/assets/sounds/im_going_to_enjoy_it.mp4', 0, false, async function(){
                for(let kicked of kickedMembers){
                    textChannel.send(kicked.user.username + " was snapped out of existence.");
                    guild.members.fetch(kicked.user.id).then(member => {
                        member.voice.setChannel(null);
                    });
                }
                await interaction.reply({ content: `${victim.nickname || victim.displayName} has received a fart`, ephemeral: true })
            });
        }
    },
};