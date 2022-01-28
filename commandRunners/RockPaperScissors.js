const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const RPS_OPTIONS = {
    Rock: "Rock",
    Paper: "Paper",
    Scissors: "Scissors",
    RockEmoji: "🪨",
    PaperEmoji: "🗒️",
    ScissorsEmoji: "✂️"
};

class RockPaperScissors {
    constructor(guild, channel, message, player1, opponent, gameMessage){
        console.log("New RockPaperScissors game started");
        this.guild = guild;
        this.channel = channel;
        this.message = message;
        this.gameMessage = gameMessage;
        this.player1 = player1;

        if (isNaN(opponent)){
            opponent = opponent.substring(opponent.indexOf('!') + 1, opponent.lastIndexOf('>'));
        } 
        this.player2 = await message.guild.members.fetch(opponent);

        this.message.delete();
        this.embedFooter = "Rock Paper Scissors";
        this.player1Name = this.player1.nickname || this.player1.displayName;
        this.player2Name = this.player2.nickname || this.player2.displayName
        this.player1Field = { name: this.player1Name, value: "not chosen", inline: true};
        this.player2Field = { name: player2Name, value: "not chosen", inline: true};
        this.player1Choice, this.player2Choice;
        
        this.embed = new MessageEmbed()
            .setTitle("Rock Paper Scissors")
            .setDescription(this.player1Name + " vs. " + this.player2Name)
            .setFields(this.player1Field, this.player2Field);

        this.rockButton = new MessageButton()
            .setCustomId(RPS_OPTIONS.Rock)
            .setEmoji(RPS_OPTIONS.RockEmoji)
            .setStyle("PRIMARY");
        this.paperButton = new MessageButton()
            .setCustomId(RPS_OPTIONS.Paper)
            .setEmoji(RPS_OPTIONS.PaperEmoji)
            .setStyle("PRIMARY");
        this.scissorsButton = new MessageButton()
            .setCustomId(RPS_OPTIONS.Scissors)
            .setEmoji(RPS_OPTIONS.ScissorsEmoji)
            .setStyle("PRIMARY");

        this.row = new MessageActionRow()
            .addComponents(this.rockButton, this.paperButton, this.scissorsButton);
    }

    async ProcessInteraction(interaction){
        if (interaction.user.id !== this.player1.id && interaction.user.id !== this.player2.id) return;
        if ((interaction.user.id === this.player1.id && this.player1Choice) || (interaction.user.id === this.player2.id && this.player2Choice))
            interaction.followUp({ content: "You've already selected an option. ", ephemeral: true });

        if (interaction.user.id === this.player1.id){
            this.player1Choice = interaction.customId;
            this.player1Field.value = "chosen";
        }
        else {
             this.player2Choice = interaction.customId;
             this.player2Field.value = "chosen";
        }

        if (this.player1Choice && this.player2Choice){
            this.player1Field.value = this.player1Choice === RPS_OPTIONS.Rock ? RPS_OPTIONS.RockEmoji : 
                (this.player1Choice === RPS_OPTIONS.Paper) ? RPS_OPTIONS.PaperEmoji : RPS_OPTIONS.ScissorsEmoji;
            this.player2Field.value = this.player2Choice === RPS_OPTIONS.Rock ? RPS_OPTIONS.RockEmoji : 
                (this.player2Choice === RPS_OPTIONS.Paper) ? RPS_OPTIONS.PaperEmoji : RPS_OPTIONS.ScissorsEmoji;

            if (this.player1Choice === this.player2Choice){
                this.embedFooter = "It's a tie! Let's go again.";
                this.rockButton.setDisabled(true);
                this.paperButton.setDisabled(true);
                this.scissorsButton.setDisabled(true);
                let disabledRow = new MessageActionRow()
                .addComponents(this.rockButton, this.paperButton, this.scissorsButton);
                interaction.editReply({
                    components: [disabledRow]
                });
                setTimeout(async () => {
                    this.embedFooter = "";
                    this.player1Field.value = this.player2Field.value = "not chosen";
                    this.player1Choice = this.player2Choice = null;
                    let updateEmbed = this.embed;;
                    updateEmbed.setFooter(this.embedFooter)
                        .setFields(this.player1Field, this.player2Field);
                    this.rockButton.setDisabled(false);
                    this.paperButton.setDisabled(false);
                    this.scissorsButton.setDisabled(false);
                    await this.gameMessage.edit({embeds: [updateEmbed], components: [row]});
                }, 3000);
            } else {
                this.#determineWinner();
                interaction.editReply({
                    components: []
                });
            }
        } else {
            this.embedFooter = "";
        }

        console.log(this.player1Field);
        console.log(this.player2Field);
        let updateEmbed = this.embed;
            updateEmbed.setFooter(this.embedFooter)
            .setFields(this.player1Field, this.player2Field);
        await this.gameMessage.edit({embeds: [updateEmbed]});
    }
    
    #determineWinner(){
        if (this.player1Choice === RPS_OPTIONS.Rock && this.player2Choice === RPS_OPTIONS.Paper){
            this.embedFooter = this.player2Name + " Wins!";
        } else if (this.player1Choice === RPS_OPTIONS.Rock && this.player2Choice === RPS_OPTIONS.Scissors){
            this.embedFooter = this.player1Name + " Wins!";
        } else if (this.player1Choice === RPS_OPTIONS.Scissors && this.player2Choice === RPS_OPTIONS.Rock){
            this.embedFooter = this.player2Name + " Wins!";
        } else if (this.player1Choice === RPS_OPTIONS.Scissors && this.player2Choice === RPS_OPTIONS.Paper){
            this.embedFooter = this.player1Name + " Wins!";
        } else if (this.player1Choice === RPS_OPTIONS.Paper && this.player2Choice === RPS_OPTIONS.Rock){
            this.embedFooter = this.player1Name + " Wins!";
        } else if (this.player1Choice === RPS_OPTIONS.Paper && this.player2Choice === RPS_OPTIONS.Scissors){
            this.embedFooter = this.player2Name + " Wins!";
        }
    }
}


module.exports = { RockPaperScissors };
