const { SlashCommandBuilder } = require('@discordjs/builders');
const discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('voice')
		.setDescription('Manage your voice channel')
        .addSubcommand(subCommand => 
            subCommand
                .setName("name")
                .setDescription("Update the name of your voice channel")
                .addStringOption(option => option.setName("name").setDescription("Name of Channel").setRequired(true)))
        .addSubcommand( subCommand =>
            subCommand
                .setName("limit")
                .setDescription("Update the user limit of your voice channel")
                .addStringOption(option => option.setName("limit").setDescription("User Limit").setRequired(true)))
        .addSubcommand( subCommand =>
            subCommand
                .setName("claim")
                .setDescription("Claim channel if the owner has left"))
        .addSubcommand( subCommand => 
            subCommand
                .setName("thread")
                .setDescription("Create a thread for your voice chat. Voice threads will be created in <#928792609055453185>.")),

	async execute(interaction) {
        let member = interaction.member;
        
        let settings = null;
        interaction.client.VoiceChannelManager.GetMemberVoiceSettings(member).then(async (result) => {
            settings = result;
            
            await interaction.client.VoiceChannelManager.GetVoiceChannelByChannelID(member.voice.channel.id).then(async function(settings){
                if (settings.ownerMemberID !== member.id && interaction.options.getSubcommand() !== "claim"){
                    await interaction.reply({ content: "You do not own this channel", ephemeral: true });
                    return;
                } else {
                    switch(interaction.options.getSubcommand()){
                        case "name": setName(interaction); break;
                        case "limit": setLimit(interaction); break;
                        case "claim": setClaim(interaction); break;
                        case "thread": createThread(interaction); break;
                    }
                }
            });
        }).catch(error => {
            console.error(error);
        });
        
        async function setName(interaction){
            let name = interaction.options.getString('name');
            if (member.voice){
                await interaction.client.VoiceChannelManager.SetThreadName(interaction.guild, interaction.client.ServerSettings.voiceThreadsChannelID, settings.voiceThreadChannelID, name).then(async () => {
                    await interaction.client.VoiceChannelManager.NameVoiceChannel(interaction.guild, member.voice.channel.id, name, member).then(async () => {
                        await interaction.reply({ content: `Your channel name has been updated to: ${name}`, ephemeral: true });
                    });
                });
                
            } else {
                await interaction.reply({ content: "You need to be in a voice channel to use this command", ephemeral: true });
            }
        }

        async function setLimit(interaction){
            let limit = parseInt(interaction.options.getString('limit'));
            if (isNaN(limit)){
                await interaction.reply({ content: "The limit you provided was not a valid number", ephemeral: true });
            }else if (member.voice){
                await interaction.client.VoiceChannelManager.UpdateVoiceChannelLimit(interaction.guild, member.voice.channel.id, limit, member).then(async () => {
                    await interaction.reply({ content: `Your channel limit has been updated to: ${limit}`, ephemeral: true });
                });
            } else {
                await interaction.reply({ content: "You need to be in a voice channel to use this command", ephemeral: true });
            }
        }

        async function setClaim(interaction){
            if (member.voice.channelID !== null){
                await interaction.reply({ content: "You need to be in a voice channel to use this command", ephemeral: true });
            }
            await interaction.client.VoiceChannelManager.GetVoiceChannelByChannelID(member.voice.channel.id).then(async function(settings){
                await interaction.guild.members.fetch(settings.ownerMemberID).then(async (owner) => {
                    if ((settings.ownerMemberID !== member.id) && member.voice.channel.id === settings.channelID && 
                                (!owner.voice.channel || owner.voice.channel.id !== settings.channelID)){
                        await interaction.client.VoiceChannelManager.SaveMemberVoiceSettings(owner, { "ownerMemberID": member.id }).then(async () =>{
                            console.log("here");
                            await interaction.reply({ content: "You have claimed this channel", ephemeral: true });
                        });
                    } else {
                        await interaction.reply({ content: "You cannot claim this channel at this time", ephemeral: true });
                    }
                });
            });
        }

        async function createThread(interaction){
            if (member.voice.channelID !== null){
                await interaction.reply({ content: "You need to be in a voice channel to use this command", ephemeral: true });
            }
            
            const thread = await interaction.client.VoiceChannelManager.CreateThread(interaction.guild, interaction.client.ServerSettings.voiceThreadsChannelID, settings, member);
        }
    },
};