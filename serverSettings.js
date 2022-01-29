const fs = require('fs');

class ServerSettings {
    constructor(client, dbName, guildID, clientID){
        
        this.guildID = guildID;
        this.clientID = clientID;
        this.dbName = dbName;
        this.getSettings(client.DB, dbName).then(settings => {
            this.voiceCreatorChannelID =  settings.voiceCreatorChannelID;
            this.voiceCreatorCategoryID =  settings.voiceCreatorCategoryID;
            this.voiceThreadsChannelID =  settings.voiceThreadsChannelID;
            this.auditLogsChannelID =  settings.auditLogsChannelID;
            client.DB.close();
        });
    }

    async getSettings(db, dbName){
        let results;
        try{
            await db.connect();
            results = await db.db(dbName).collection("serverSettings").findOne();
            return results;
        } catch(e) {
            console.log(e);
        }
    }
}
module.exports = { ServerSettings }