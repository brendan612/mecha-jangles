module.exports = (client, reaction, user) => {
    const QuickChart = require("quickchart-js");
    const { MessageEmbed } = require('discord.js');
    
    const REACTIONS = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];

    if (user.bot) return;

    let message = reaction.message;

    if (message.interaction != null){
        if (message.interaction.commandName === 'poll'){
            
            if (!REACTIONS.includes(reaction.emoji.name)){
                console.log("invalid emoji");
                 removeReaction(reaction); return;
            }
            const botReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(client.ServerSettings.clientID));
            if (botReactions.size == 0){
                removeReaction(reaction);
                return;
            }
            const userReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));
            try{
                if (userReactions.size > 1){
                    console.log("size", userReactions.size);
                    removeReaction(reaction);
                } else {
                    updateEmbed(message);
                }
            } catch(e) {
                console.log("error:\n"+ e.message);
            }
        }
    }

    async function removeReaction(reaction){
        await reaction.users.remove(user.id);
    }

    async function updateEmbed(message){
        let msg = await client.guilds.cache.get(message.guildId).channels.cache.get(message.channelId).messages.fetch(message.id);
        let embed = msg.embeds[0];
        let labels = [];
        let data = [];

        let reactions = [...msg.reactions.cache];

        for(let i = 0; i < embed.fields.length; i++){
            labels.push(embed.fields[i].value);
            let reaction = reactions[i];
            data.push(msg.reactions.cache.get(REACTIONS[i]).count - 1);
        }

        const chart = new QuickChart();
        chart.setConfig({
            type: 'bar',
            data: { labels: labels, datasets: [{label: "Results", data: data }] }
        });

        const url = await chart.getShortUrl();
        let newEmbed = new MessageEmbed(embed);
        newEmbed.setImage(url);
        msg.edit({ embeds: [newEmbed] });
    }
};