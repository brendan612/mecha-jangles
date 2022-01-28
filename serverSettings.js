const fs = require('fs');

class ServerSettings {
    constructor(){
        let file = fs.readFileSync('./serverSettings.json');
        let settings = JSON.parse(file);
        this.voiceCreatorChannelID = settings.voiceCreatorChannelID;
        this.voiceCreatorCategoryID = settings.voiceCreatorCategoryID;
        this.voiceThreadsChannelID = settings.voiceThreadsChannelID;
        this.auditLogsChannelID = settings.auditLogsChannelID;
        this.guildID = settings.guildID;
    }
}
module.exports = { ServerSettings }