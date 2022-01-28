exports.run = async (client, message, [userid]) => {
    const { RockPaperScissors } = require("../commandRunners/RockPaperScissors.js");
    const guild = message.guild;
    const channel = message.channel;
    let player1 = message.member;
    
    let gameMessage = await channel.send({embeds: [embed], components: [row] });

        const RPS = new RockPaperScissors(guild, channel, message, player1, userid, gameMessage);

        client.on("interactionCreate", async interaction => {
            if (!interaction.isButton()) return;
            await interaction.deferReply();
            await RPS.ProcessInteraction(interaction);
            // await processInteraction(interaction, gameMessage);
        });
}