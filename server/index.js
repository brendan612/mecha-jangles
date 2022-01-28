const express = require('express');
const app = express();
const { spawn } = require('child_process');

let botProcess = null;

const BotStatusEnum = {
    STOPPED: -1,
    RUNNING: 0
}

let currentBotStatus = BotStatusEnum.STOPPED;

const PORT = 3001;
function startStopBot( scriptPath, callback){
    if (currentBotStatus === BotStatusEnum.STOPPED){
        botProcess = spawn('node', [scriptPath]);

        console.log("bot spawned");

        botProcess.stdout.on('data', (data) => {
            console.log(data.toString('utf8'));
            if (currentBotStatus === BotStatusEnum.STOPPED){
                currentBotStatus = BotStatusEnum.RUNNING;
                callback();
            }
        });
    
        botProcess.stderr.on('data', (data) => {
            currentBotStatus = BotStatusEnum.STOPPED;
        });
    } else {

        console.log("bot killed");

        botProcess.kill();
        currentBotStatus = BotStatusEnum.STOPPED;
        callback();
    }
}

function executeBotCommand(command, callback){
    botProcess.stdin.write(command + "\n");
    callback();
}

app.use(express.json());

app.listen(PORT, () => { //Start Server
    console.log(`Server listening on ${PORT}.`);
});

//--------------- API Endpoints ---------------

app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!"});
});

app.get("/startStopBot", (req, res) => {
    console.log("starting bot - server");
    startStopBot('../bot/index.js', function(){
        res.json({ botStatus: currentBotStatus });
    });
});

app.get("/getBotStatus", (req, res) => {
    res.json({ botStatus: currentBotStatus });
});

app.get("/executeBotCommand", (req, res) => {
    console.log("got api requested command");
    executeBotCommand(req.query.command, function(){
        res.json({ commandStatus: 0});
    });
});
