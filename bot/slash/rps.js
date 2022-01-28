const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rps')
		.setDescription('Play Rock Paper Scissors against someone')
        .addMentionableOption(option => option.setName("opponent").setDescription("Your opponent").setRequired(true)),
	async execute(interaction) {
        const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
        let player1 = interaction.member;
        let player2 = interaction.options.getMentionable('opponent');

        const RPS_OPTIONS = {
            Rock: "Rock",
            Paper: "Paper",
            Scissors: "Scissors",
            RockEmoji: "🪨",
            PaperEmoji: "🗒️",
            ScissorsEmoji: "✂️"
        };
    
        let embedFooter = "Rock Paper Scissors";
        let player1Name = player1.nickname || player1.displayName;
        let player2Name = player2.nickname || player2.displayName
        let player1Field = { name: player1Name, value: "not chosen", inline: true};
        let player2Field = { name: player2Name, value: "not chosen", inline: true};
        let player1Choice, player2Choice;
    
        const embed = new MessageEmbed()
            .setTitle("Rock Paper Scissors")
            .setDescription(player1Name + " vs. " + player2Name)
            .setFields(player1Field, player2Field);
    
        const rockButton = new MessageButton()
            .setCustomId(RPS_OPTIONS.Rock)
            .setEmoji(RPS_OPTIONS.RockEmoji)
            .setStyle("PRIMARY");
        const paperButton = new MessageButton()
            .setCustomId(RPS_OPTIONS.Paper)
            .setEmoji(RPS_OPTIONS.PaperEmoji)
            .setStyle("PRIMARY");
        const scissorsButton = new MessageButton()
            .setCustomId(RPS_OPTIONS.Scissors)
            .setEmoji(RPS_OPTIONS.ScissorsEmoji)
            .setStyle("PRIMARY");
    
        const row = new MessageActionRow()
            .addComponents(rockButton, paperButton, scissorsButton);


        if (interaction.isCommand()){
            beginGame();
        } else if (interaction.isButton()){
            await interaction.deferReply();
            await processInteraction();
        }
    
        async function beginGame(){
            await interaction.reply({embeds: [embed], components: [row] });

            const collector = interaction.channel.createMessageComponentCollector({  time: 15000 });
            collector.on('collect', async i => {
                await i.deferUpdate();
                processInteraction(i)
            });
        }
    
        async function processInteraction(i){
            if (i.user.id !== player1.id && i.user.id !== player2.id) return;
            if ((i.user.id === player1.id && player1Choice) || (i.user.id === player2.id && player2Choice))
                i.followUp({ content: "You've already selected an option. ", ephemeral: true });
    
            if (i.user.id === player1.id){
                player1Choice = i.customId;
                player1Field.value = "chosen";
            }
            else {
                 player2Choice = i.customId;
                 player2Field.value = "chosen";
            }
    
            if (player1Choice && player2Choice){
                player1Field.value = player1Choice === RPS_OPTIONS.Rock ? RPS_OPTIONS.RockEmoji : player1Choice === RPS_OPTIONS.Paper ? RPS_OPTIONS.PaperEmoji : RPS_OPTIONS.ScissorsEmoji;
                player2Field.value = player2Choice === RPS_OPTIONS.Rock ? RPS_OPTIONS.RockEmoji : player1Choice === RPS_OPTIONS.Paper ? RPS_OPTIONS.PaperEmoji : RPS_OPTIONS.ScissorsEmoji;
                if (player1Choice === player2Choice){
                    embedFooter = "It's a tie! Let's go again.";
                    rockButton.setDisabled(true);
                    paperButton.setDisabled(true);
                    scissorsButton.setDisabled(true);
                    let disabledRow = new MessageActionRow()
                    .addComponents(rockButton, paperButton, scissorsButton);
                    interaction.editReply({
                        components: [disabledRow]
                    });
                    setTimeout(async () => {
                        embedFooter = "";
                        player1Field.value = player2Field.value = "not chosen";
                        player1Choice = player2Choice = null;
                        let updateEmbed = embed;
                        updateEmbed.setFooter(embedFooter)
                            .setFields(player1Field, player2Field);
                        rockButton.setDisabled(false);
                        paperButton.setDisabled(false);
                        scissorsButton.setDisabled(false);
                        await interaction.editReply({embeds: [updateEmbed], components: [row]});
                    }, 3000);
                } else { //determine winner
                    if (player1Choice === RPS_OPTIONS.Rock && player2Choice === RPS_OPTIONS.Paper){
                        embedFooter = player2Name + " Wins!";
                    } else if (player1Choice === RPS_OPTIONS.Rock && player2Choice === RPS_OPTIONS.Scissors){
                        embedFooter = player1Name + " Wins!";
                    } else if (player1Choice === RPS_OPTIONS.Scissors && player2Choice === RPS_OPTIONS.Rock){
                        embedFooter = player2Name + " Wins!";
                    } else if (player1Choice === RPS_OPTIONS.Scissors && player2Choice === RPS_OPTIONS.Paper){
                        embedFooter = player1Name + " Wins!";
                    } else if (player1Choice === RPS_OPTIONS.Paper && player2Choice === RPS_OPTIONS.Rock){
                        embedFooter = player1Name + " Wins!";
                    } else if (player1Choice === RPS_OPTIONS.Paper && player2Choice === RPS_OPTIONS.Scissors){
                        embedFooter = player2Name + " Wins!";
                    }
    
                    interaction.editReply({
                        components: []
                    });
                }
            } else {
                embedFooter = "";
            }
    
            let updateEmbed = embed;
                updateEmbed.setFooter(embedFooter)
                .setFields(player1Field, player2Field);
            await interaction.editReply({embeds: [updateEmbed]});
            
        }
	},
};