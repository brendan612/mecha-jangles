const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('Create a poll')
        // .setDefaultPermission(false)
        .addStringOption(option => option.setName("name").setDescription("Name of Poll").setRequired(true))
        .addStringOption(option => option.setName("end").setDescription("End Time of Poll").setRequired(true))
        .addStringOption(option => option.setName("option1").setDescription("Option 1").setRequired(true))
        .addStringOption(option => option.setName("option2").setDescription("Option 2").setRequired(true))
        .addStringOption(option => option.setName("option3").setDescription("Option 3").setRequired(false))
        .addStringOption(option => option.setName("option4").setDescription("Option 4").setRequired(false))
        .addStringOption(option => option.setName("option5").setDescription("Option 5").setRequired(false))
        .addStringOption(option => option.setName("option6").setDescription("Option 6").setRequired(false))
        .addStringOption(option => option.setName("option7").setDescription("Option 7").setRequired(false))
        .addStringOption(option => option.setName("option8").setDescription("Option 8").setRequired(false))
        .addStringOption(option => option.setName("option9").setDescription("Option 9").setRequired(false))
        .addStringOption(option => option.setName("option10").setDescription("Option 10").setRequired(false)),
	async execute(interaction) {
        const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
        const cronitor = require('cronitor')('784fb050ec0d4f64bdff8cacc96e4adf');
        const cron = require('node-cron');
        const moment = require('moment');
        const QuickChart = require("quickchart-js");

        let creator = interaction.member;
        let icon = creator.user.avatarURL();
        let pollName = interaction.options.getString('name');
        let endDate = translateEndDateParameter(interaction.options.getString("end"));
        let displayEndDate = moment(endDate).format('MMM DD YYYY h:mm:ss [EST]');
        let db = interaction.client.DB;

        const REACTIONS = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];

        const embed = new MessageEmbed()
        .setTitle(`${pollName}`)
        .setDescription(`Ends: ${displayEndDate}`)
        .setFooter({ text: "Created by: " + creator.nickname || creator.displayName, iconURL: icon });

        if (endDate != null){
            let poll_options = [];
            for(let i = 0; i < 10; i++){
                let option = interaction.options.getString("option" + (i+1));
                if (option){
                    poll_options.push({
                        buttonID: (i+1),
                        value: option,
                        count: 0
                    });
                    embed.addField(REACTIONS[i], option, true);
                }
            }

            const message = await interaction.reply({embeds: [embed], fetchReply: true });

            let poll = {
                name: pollName,
                endDate: endDate,
                createdBy: creator.id,
                messageID: message.id,
                channelID: message.channel.id,
                poll_options: poll_options
            }

            db.connect(err => {
                const collection = db.db("mecha-jangles").collection("polls");
                
                collection.insertOne(poll, function(err, res){
                    if (err) throw err;
                    
                    attachReactions(message);
                    
                    let task = cron.schedule(dateToCron(endDate), function(){
                        closePoll(interaction, message);
                    }, { timezone: "America/New_York" });
                    task.start();

                    db.close();
                });
            });

        } else {
            await interaction.reply("Invalid End Date! Please use this format: (integer){m/h/d} (example for 7 hours: 7h)");
        }

        function translateEndDateParameter(end){
            let regex = /^(\d{1,2})(m|h|d)$/i;
            let matches = end.match(regex);
            
            let endDate = moment();
            endDate.add(matches[1], matches[2]);
            endDate.add(3, 'h');
            return endDate.toDate();
        }

        async function attachReactions(message){
            for(let i = 0; i < 10; i++){
                let option = interaction.options.getString("option" + (i+1));
                if (option){
                    await message.react(REACTIONS[i]);
                }
            }
        }

        async function closePoll(interaction, message){
            let db = interaction.client.DB;

            db.connect(err => {
                const collection = db.db("mecha-jangles").collection("polls");
                const REACTIONS = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];
                collection.find({ messageID: message.id}).toArray(function(err, result){
                    if (err) throw err;
                    let poll_options = result[0].poll_options;
                    let existing = { messageID: message.id };
                    
                    for(let i = 0; i < poll_options.length; i++){
                        poll_options[i].count = message.reactions.cache.get(REACTIONS[i]).count - 1
                    }

                    let updated = { $set: { "poll_options": poll_options }};

                    collection.updateOne(existing, updated, function(err, res){
                        if (err) throw err;
                        updateEmbed(interaction, message);
                        db.close();
                    });
                });
            });

            async function updateEmbed(interaction, message){
                embed.setDescription(`Ended: ${displayEndDate}`);
                let labels = [];
                let data = [];
                for(let i = 0; i < embed.fields.length; i++){
                    labels.push(embed.fields[i].value);
                    data.push(message.reactions.cache.get(REACTIONS[i]).count - 1);
                }

                const chart = new QuickChart();
                chart.setConfig({
                    type: 'bar',
                    data: { labels: labels, datasets: [{label: "Results", data: data }] }
                });

                const url = await chart.getShortUrl();
                embed.setImage(url);
                embed.setFields([]);

                await interaction.editReply({embeds: [embed]});
                await message.reactions.removeAll();
            }

        }

        function dateToCron(date) {
            const seconds = date.getSeconds();
            const minutes = date.getMinutes();
            const hours = date.getHours();
            const days = date.getDate();
            const months = date.getMonth() + 1;
            const dayOfWeek = date.getDay();
            return `${seconds} ${minutes} ${hours} ${days} ${months} ${dayOfWeek}`;
        };
	},
};