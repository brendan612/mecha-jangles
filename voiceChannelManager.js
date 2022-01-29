const { Permissions } = require('discord.js');

class VoiceChannelManager {
    constructor(client){
        this.client = client;
        this.member = null;
        this.guild = null;
    }
    
    async CreateVoiceChannel(guild, member, callback){
        let memberSettings = this.GetMemberVoiceSettings(member);
        let memberName = member.nickname || member.displayName;
        let channelID = null;
        let db = this.client.DB;
        let client = this.client;
        this.guild = guild;
        let $this = this;

        this.GetMemberVoiceSettings(member).then(async function(settings){
            if (settings.default){
                insert(member).then(result => {
                    create(result);
                    return;
                });
            }
            create(settings);
            

            async function create(dbMember){
                guild.roles.fetch("868280751509110858").then(function(role){
                    guild.channels.create(dbMember.voiceChannelName, {
                        type: 'GUILD_VOICE',
                        userLimit: dbMember.userLimit
                    }).then(channel => { 
                        channel.setParent(client.ServerSettings.voiceCreatorCategoryID).then(function(){
                            channel.permissionOverwrites.create(role, {
                                VIEW_CHANNEL: false
                            }).then(function(){
                                $this.SaveMemberVoiceSettings(member, { "channelID": channel.id, "ownerMemberID": member.id }).then(function(){
                                    callback(channel.id);
                                });
                            }).catch(console.error);
                        });
                    });
                });
            }

            async function insert(member){
                return new Promise((resolve, reject) => {
                    db.connect(err => {
                        const collection = db.db("mecha-jangles").collection("memberVoiceChannelSettings");
                        let doc = {
                            "default": false,
                            "memberID": member.id,
                            "voiceChannelName": memberSettings.channelName || `${memberName}'s Room`,
                            "userLimit": 0,
                            "ownerMemberID": member.id
                        };
                        collection.insert(doc, function(err, res){
                            if (err) throw err;
                            resolve(res);
                        });
                    });
                });
            }
        });

        
        
    }

    async DeleteVoiceChannel(guild, channelID){
        return new Promise(async (resolve, reject) => {
            let channel = await guild.channels.fetch(channelID);
            channel.delete();
            resolve();
        });
    }

    async NameVoiceChannel(guild, channelID, name, member){
        return new Promise(async (resolve, reject) => {
            let channel = await guild.channels.fetch(channelID);
            channel.setName(name);
            this.SaveMemberVoiceSettings(member, { "voiceChannelName": name });
            resolve();
        });
    }

    async UpdateVoiceChannelLimit(guild, channelID, limit, member){
        return new Promise(async (resolve, reject) => {
            let channel = await guild.channels.fetch(channelID);
            channel.edit({ userLimit: limit });
            this.SaveMemberVoiceSettings(member, { "userLimit": limit });
            resolve();
        });
    }

    async MoveMember(member, channelID){
        if (!member.voice.channelID === null){
            this.DeleteVoiceChannel(this.guild, channelID);
        }
            
        else
            member.voice.setChannel(channelID);
    }

    async GetMemberVoiceSettings(member){
        let db = this.client.DB;
        return new Promise((resolve, reject) => {
            db.connect(err => {
                const collection = db.db("mecha-jangles").collection("memberVoiceChannelSettings");
                collection.find({ memberID: member.id }).toArray(function(err, result){
                    if (result.length > 0) {
                        resolve(result[0]);
                    }
                    else {
                        collection.find({ default: true }).toArray(function(err, res){
                            resolve(res[0]);
                        });
                    }
                });
            });
        });
    }

    async GetVoiceChannelByChannelID(channelID){
        let db = this.client.DB;
        return new Promise((resolve, reject) => {
            db.connect(err => {
                const collection = db.db("mecha-jangles").collection("memberVoiceChannelSettings");
                collection.find({ channelID: channelID }).toArray(function(err, result){
                    if (result.length > 0) {
                        resolve(result[0]);
                    } else {
                        resolve(null);
                    }
                });
            });
        });
    }

    async SaveMemberVoiceSettings(member, updated){
        let db = this.client.DB;
        return new Promise((resolve, reject) => {
            db.connect(err => {
                const collection = db.db("mecha-jangles").collection("memberVoiceChannelSettings");
                collection.find({ memberID: member.id }).toArray(function(err, result){
                    if (err) throw err;
                    let existing = { memberID: member.id }
                    let upd = { $set: updated };

                    collection.updateOne(existing, upd, function(err, res){
                        if (err) throw err;
                        db.close();
                        resolve();
                    });
                });
            });
        });
    }

    async CreateThread(guild, channel, settings, member){
        return new Promise(async (resolve, reject) => {
            const threadsChannel = await guild.channels.fetch(channel);
            const thread = await threadsChannel.threads.create({
                name: settings.voiceChannelName,
                autoArchiveDuration: 1440,
                reason: `Thread for ${member.user.tag}`
            });
            await thread.join();
            this.SaveMemberVoiceSettings(member, { "voiceThreadChannelID": thread.id });
            resolve(thread);
        });
    }

    async SetThreadName(guild, channel, threadID, name){
        console.log("here thread name");
        const threadsChannel = await guild.channels.fetch(channel);
        const thread = await threadsChannel.threads.fetch(threadID);
        await thread.setName(name);
    }
}



module.exports = { VoiceChannelManager }