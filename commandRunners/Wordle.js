const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const BLANK_SQUARE = "◻️";
const YELLOW_SQUARE = "🟨";
const GREEN_SQUARE = "🟩";
class Wordle {
    constructor(){
        this.word = "";
        this.expireTime = new Date();
    }
    
    async StartGame(client, channel){
        let description = "";
        for (let j = 0; j < 6; j++){
            for(let i = 0; i < 5; i++){
                description += `${BLANK_SQUARE} `
            }
            description += `\n`;
        }
        const embed = new MessageEmbed()
            .setTitle(`Today's Wordle!`)
            .setDescription(description);
        

        channel.send({ embeds: [embed] });
    }
    async ProcessGuess(client, member){
        this.GetStats(client, member).then(result => {
            if (result !== undefined){
                if (result.playedToday){
                    member.send("You have already played today.");
                    return;
                } else {
                    if (result.activeGame){

                    }
                }
            }
        });
    }

    async GetStats(client, member){
        let db = client.DB;
        return new Promise((resolve, reject) => {
            db.connect(err => {
                const collection = db.db(client.ServerSettings.dbName).collection("wordleStats");
                collection.find({ memberID: member.id }).toArray(function(err, result){
                    resolve(result?.[0]);
                });
            });
        });
    }
}

module.exports = { Wordle };