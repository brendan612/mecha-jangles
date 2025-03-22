module.exports = (client,message) => {
    const fs = require('fs');
    //Ignore all bots
    if (message.author.bot) return;
    
    if (message.guildId !== null || message.guildId !== undefined){
        client.Wordle.ProcessGuess(client, message.author);
        return;
    }

    const bannedWordsSettings = JSON.parse(fs.readFileSync("bannedWordsList.json"));
    const autoResponder = JSON.parse(fs.readFileSync("autoResponder.json"));

    //banned words
    if (!message.member.roles.cache.some(role => bannedWordsSettings.exemptRoles.includes(role.id))){
        if (bannedWordsSettings.bannedWords.some(word => message.content.includes(word))){
            message.delete()
                .then(client.Audit.LogDeletedMessage(client, message, message.member, message.channel.id, "Banned Words"));
            return;
        }
    }

    //invite links
    if (message.content.includes('discordapp.com/invite/' || 'discord.com/invite') 
        || (message.content.includes('discord.gg/') && !message.content.includes('?event='))) {
        message.delete()
            .then(client.Audit.LogDeletedMessage(client, message, message.member, message.channel.id, "Invite Link"));
        return;
    }

    //spam prevention
    if(client.SpamMap.has(message.author.id)) {
        const userData = client.SpamMap.get(message.author.id);
        const { lastMessage, timer } = userData;
        const difference = message.createdTimestamp - lastMessage.createdTimestamp;
        let msgCount = userData.msgCount;

        if(difference > client.SpamDiff) {
            clearTimeout(timer);
            userData.msgCount = 1;
            userData.lastMessage = message;
            userData.timer = setTimeout(() => {
                client.SpamMap.delete(message.author.id);
            }, client.SpamDiff);
            client.SpamMap.set(message.author.id, userData)
        }
        else {
            ++msgCount;
            if(parseInt(msgCount) === client.SpamLimit) {

              message.reply("You're spamming. Slow your roll champ");
              message.channel.bulkDelete(client.SpamLimit);
               
            } else {
                userData.msgCount = msgCount;
                client.SpamMap.set(message.author.id, userData);
            }
        }
    }
    else {
        let fn = setTimeout(() => {
            client.SpamMap.delete(message.author.id);
        }, client.SpamDiff);
        client.SpamMap.set(message.author.id, {
            msgCount: 1,
            lastMessage : message,
            timer : fn
        });
    }

    //auto response
    const autoResponse = autoResponder.autoResponses.find(element => element[message.content]);
    
    if (autoResponse){
        message.channel.send(autoResponse[message.content]);
    }

    return;
    if (message.channel.id === "909293829084053574"){
        if (message.author.bot) return;
        
        const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
        require('@tensorflow/tfjs-node');
        const toxicity = require('@tensorflow-models/toxicity');
        const threshold = 0.9;

        let embed = new MessageEmbed()
            .setTitle("Toxicity Results")
            .setDescription("Checking message: " + message.content);

        let flag = false;

        toxicity.load(threshold).then(model => {
            const sentences = [message.content];
            model.classify(sentences).then(predictions => {
                for (let prediction of predictions) {
                    if (prediction.results[0].match == null) continue;
                    else if (prediction.results[0].match) flag = true;
                    console.log(prediction.results[0]);
                    let likely = (prediction.results[0].probabilities[0].toFixed(5) * 100) + "%";
                    let unlikely = (prediction.results[0].probabilities[1].toFixed(5) * 100) + "%";
                    embed.addField(prediction.label, prediction.results[0].match + " | probability: " + likely + ", " + unlikely);
                }

                if (flag)
                    embed.setFooter("This message was considered toxic.");

                message.channel.send({ embeds: [embed] });
            });
        });
    }
}