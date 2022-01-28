const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Get stats for this server.')
        .setDefaultPermission(true),
	async execute(interaction) {
        const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
        const moment = require('moment');
        let guild = interaction.guild;
        console.log(guild);
        let guildDate = moment(guild.createdAt).format('MMM DD, YYYY');
        let owner = await guild.members.fetch(guild.ownerId);
        const embed = new MessageEmbed()
            .setTitle(`${guild.name} Stats`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: "Owner", value: `${owner.user.tag}` },
                { name: "Member Count", value: `${guild.memberCount}` }
            )
            .setFooter(`ID: ${guild.id} | Server Created: ${guildDate}`)
    
        await interaction.reply({embeds: [embed]});
        
        
    },
};