const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

class Audit {
    constructor(guildID, auditLogsChannelID){
        this.guildID = guildID;
        this.auditLogsChannelID = auditLogsChannelID;
    }

    async LogDeletedMessage(client, message, member, channelID, reason){
        const embed = new MessageEmbed()
        .setColor('#A10003')
        .setAuthor({ name: member.user.tag, iconURL: member.user.avatarURL() })
        .setTitle(`Deleted message via Mecha Jangles`)
        .setFooter({ text: `Member: ${member.id} | Message ID: ${message.id} | Today at ${moment(new Date()).format('hh:mm:ss A')}` });
        embed.addField(`Reason:`, `${reason}`, true);
        embed.addField(`From:`, `<@${member.id}>`, true);
        embed.addField(`In:`, `<#${channelID}>`, true);
        embed.addField(`Contents:`, `${message.content}`);
        let guild = client.guilds.cache.find((guild) => guild.id == this.guildID);
        let channel = guild.channels.cache.find((channel) => channel.id == this.auditLogsChannelID)
        channel.send({embeds: [embed]});
    }
}
module.exports = { Audit }