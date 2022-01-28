const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ttt')
		.setDescription('Play a game of Tic Tac Toe!')
        .addMentionableOption(option => option.setName("opponent").setDescription("Your opponent").setRequired(true)),
	async execute(interaction) {
        await interaction.deferReply();
		const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
        let player1 = interaction.member;
        let player2 = interaction.options.getMentionable('opponent');
        let player1Shape, player2Shape;
        let currentTurn;
        let turnCount = 1;

        const TTT_Options = [
            "1️⃣",
            "2️⃣",
            "3️⃣",
            "4️⃣",
            "5️⃣",
            "6️⃣",
            "7️⃣",
            "8️⃣",
            "9️⃣"
        ];

        const squares = [
            { name: '\u200B', value: TTT_Options[0], inline: true, position: 1, player: -1 },
            { name: '\u200B', value: TTT_Options[1], inline: true, position: 2, player: -1 },
            { name: '\u200B', value: TTT_Options[2], inline: true, position: 3, player: -1 },
            { name: '\u200B', value: TTT_Options[3], inline: true, position: 4, player: -1 },
            { name: '\u200B', value: TTT_Options[4], inline: true, position: 5, player: -1 },
            { name: '\u200B', value: TTT_Options[5], inline: true, position: 6, player: -1 },
            { name: '\u200B', value: TTT_Options[6], inline: true, position: 7, player: -1 },
            { name: '\u200B', value: TTT_Options[7], inline: true, position: 8, player: -1 },
            { name: '\u200B', value: TTT_Options[8], inline: true, position: 9, player: -1 }
        ]
    
        
        player1.playerName = player1.nickname || player1.displayName;
        player2.playerName = player2.nickname || player2.displayName;
        player1.playerPosition = 1;
        player2.playerPosition = 2;
        
        let rand = Math.round(Math.random());
        if (rand === 0) {
            player1.Shape = "🇽";
            player2.Shape = "🇴";
            currentTurn = player1;
        } else {
            player1.Shape = "🇴";
            player2.Shape = "🇽";
            currentTurn = player2;
        }

        let embedFooter = "Current Turn: " + currentTurn.playerName;

        const embed = new MessageEmbed()
            .setTitle("Tic Tac Toe")
            .setDescription(player1.playerName + " vs. " + player2.playerName)
            .addFields(
                { name: player1.playerName, value: player1.Shape, inline: true },
                { name: player2.playerName, value: player2.Shape, inline: true },
                { name: '\u200B', value: '\u200B' },
            )
            .setFooter(embedFooter);
                
        for(let i = 0; i < 9; i++){
            let square = squares[i];
            embed.addField('\u200B', square.value, square.inline);
        }

        const buttons = [];
        console.log(TTT_Options[0]);
        for(var i = 0; i < 9; i++){
            buttons.push(
                new MessageButton()
                    .setCustomId((i+1) + "")
                    .setEmoji(TTT_Options[i])
                    .setStyle("PRIMARY")
            );
        }

        const row = new MessageActionRow()
            .addComponents(buttons[0], buttons[1], buttons[2]);
        const row2 = new MessageActionRow()
            .addComponents(buttons[3],buttons[4], buttons[5]);
        const row3 = new MessageActionRow()
            .addComponents(buttons[6], buttons[7], buttons[8]);

        if (interaction.isCommand()){
            beginGame();
        }
    
        async function beginGame(){
            await interaction.editReply({embeds: [embed], components: [row, row2, row3] });

            const collector = interaction.channel.createMessageComponentCollector({  time: 15000 });
            collector.on('collect', async i => {
                await i.deferUpdate();
                processInteraction(i)
            });
        }
    
        async function processInteraction(i){
            turnCount++;
            if (i.user.id !== currentTurn.id) return;
            let selectedSquare = parseInt(i.customId);
            let updateEmbed = embed;
            updateEmbed.setFields(
                    { name: player1.playerName, value: player1.Shape, inline: true },
                    { name: player2.playerName, value: player2.Shape, inline: true },
                    { name: '\u200B', value: '\u200B' },
                )
            
            let currentBoard = [];
            let winner = false;
            for(let i = 0; i < 9; i++){
                let square = squares[i];
                if (selectedSquare === (i + 1)){
                    updateEmbed.addField('\u200B', currentTurn.Shape, square.inline);
                    square.value = currentTurn.Shape;
                    square.player = currentTurn.playerPosition;
                } else {
                    updateEmbed.addField('\u200B', square.value, square.inline);
                }

                currentBoard.push(square.player);
                
                let result = checkWin(currentBoard, currentTurn);
                if (result){
                    winner = true;
                }
                //determine if theres a winner

            }
            
            if (turnCount === 9 && !winner){
                updateEmbed.setFooter("The game ended in a tie.");
                await interaction.editReply({embeds: [updateEmbed], components: []});
                return;
            }

            if (winner){
                updateEmbed.setFooter("WINNER: " + currentTurn.playerName);
                await interaction.editReply({embeds: [updateEmbed], components: []});
                return;
            } else {
                if (currentTurn.id === player1.id) currentTurn = player2;
                else currentTurn = player1;
                updateEmbed.setFooter("Current Turn: " + currentTurn.playerName);
            }

            await interaction.editReply({embeds: [updateEmbed]});
        }

        function checkWin(board, currentTurn){
            const winMap = [123, 456, 789, 147, 258, 369, 357, 159];

            const moves = board.reduce((players, v, i) => {
                if(v) players[v-1] += i+1
                return players
            }, ['', '']);
            
            const winningMove = winMap.find(comb =>
                moves.some(m => // there are only 2 sets of moves, one for each player
                    // break down the current combination to array and check if every item exists
                    // also in the current set of moves. quit on first match.
                    comb.toString().split('').every(c => m.includes(c))
                )
            )

            return winningMove ?
                {   // get the first number of the winning-move, 
                    // substract 1 from it, and use as index to find which
                    // player played that move from the board Array
                    player: currentTurn.playerName,
                    move: winningMove
                } 
            : false
        }
	}
};