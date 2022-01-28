const queue = require("./node_modules/queue")

class VoiceConnectionManager{
    constructor(){
        this.connection = null;
        this.player = null;
        this.queue = queue({ results: [], autostart: true });
    }

    async PlaySound(channelId, guildId, adapterCreator, filePath, delay, continueQueue = false, callback){
        const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');

        // if (this.connection !== null || this.player !== null && !continueQueue){
        //     this.queue.push(new QueuedVoiceConnection(channelId, guildId, adapterCreator, filePath, delay));
        //     return;
        // }

        if (delay) await sleep(delay);

        this.connection = joinVoiceChannel({
            channelId: channelId,
            guildId: guildId,
            adapterCreator: adapterCreator,
            selfDeaf: false
        });

        this.player = createAudioPlayer();
        this.player.on(AudioPlayerStatus.Idle, () => {
            console.log("audio has finished");
            if (this.queue.length > 0){
                let qvc = this.queue.jobs[0];
                this.queue = this.queue.shift();
                // this.PlaySound(qvc.channelId, qvc.guildId, qvc.adapterCreator, qvc.filePath, qvc.delay, false);
                // if (qvc.channelId === this.connection.channelId){
                //     this.PlaySound(qvc.channelId, qvc.guildId, qvc.adapterCreator, qvc.filePath, qvc.delay, true);
                // } else {
                //     this.PlaySound(qvc.channelId, qvc.guildId, qvc.adapterCreator, qvc.filePath, qvc.delay, false);
                    
                    this.connection.destroy();
                    this.connection = null;
                    this.player = null;
                //}

            }

            this.connection.destroy();
            this.connection = null;
            this.player = null;

            if (callback !== undefined) callback();
        });

        const funny_sound = createAudioResource(filePath);
        this.player.play(funny_sound);
        console.log("audio has started");
        this.connection.subscribe(this.player);
    }

    async PlayTTS(channelId, guildId, adapterCreator, content, delay, continueQueue = false, callback){
        const say = require('say');
        const fs = require('fs');
        const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
        console.log(channelId, guildId);
        if (!fs.existsSync('./temp')){
            fs.mkdirSync('./temp');
        }
        const timestamp = new Date().getTime();
        const soundPath = `./temp/${timestamp}.mp3`;
        say.export(content, 'Microsoft David Desktop', 1, soundPath, (err) => {
            if (err) {
                console.error(err);
                return;
            }else{
                this.connection = joinVoiceChannel({
                    channelId: channelId,
                    guildId: guildId,
                    adapterCreator: adapterCreator,
                    selfDeaf: false
                });

                this.player = createAudioPlayer();
                this.player.on(AudioPlayerStatus.Idle, () => {
                    console.log("audio has finished");
                    this.connection.destroy();
                    this.connection = null;
                    this.player = null;
                    fs.unlinkSync(soundPath);
                    if (callback !== undefined) callback();
                });

                const funny_sound = createAudioResource(soundPath);
                this.player.play(funny_sound);
                console.log("audio has started");
                this.connection.subscribe(this.player);
            }
        });
    }
    
}

class QueuedVoiceConnection{
    constructor(channelId, guildId, adapterCreator, filePath, delay){
        this.channelId = channelId;
        this.guildId = guildId;
        this.adapterCreator = adapterCreator;
        this.filePath = filePath;
        this.delay = delay;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

module.exports = { VoiceConnectionManager, QueuedVoiceConnection };
