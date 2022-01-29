const fartCD = new Set();

const VoiceUpdateEnum = {
    JOIN: 0,
    LEAVE: 1,
    MUTEDEAF: 2,
    UNMUTEDEAF: 3,
    DEAF: 4,
    UNDEAF: 5,
    MUTE: 6,
    UNMUTE: 7,
    STARTSTREAM: 8,
    ENDSTREAM: 9,
    STARTVIDEO: 10,
    ENDVIDEO: 11,
    UNKNOWN: 100
}

function determineVoiceUpdate(oldState, newState){
    if (oldState.channelId === undefined || oldState.channelId === null || (oldState.channelId !== newState.channelId && newState.channelId !== null && newState.channelId !== undefined))
        return VoiceUpdateEnum.JOIN;
    else if (newState.channelId === undefined || newState.channelId === null || newState.channelId !== oldState.channelId)
        return VoiceUpdateEnum.LEAVE;
    else if ((!oldState.selfDeaf && !oldState.selfMute && newState.selfMute && newState.selfDeaf) || (!oldState.serverDeaf && !oldState.serverMute && newState.serverDeaf && newState.serverMute))
        return VoiceUpdateEnum.MUTEDEAF;
    else if ((oldState.selfDeaf && oldState.selfMute && !newState.selfMute && !newState.selfDeaf) || (oldState.serverDeaf && oldState.serverMute && !newState.serverDeaf && !newState.serverMute))
        return VoiceUpdateEnum.UNMUTEDEAF;
    else if ((!oldState.selfDeaf && newState.selfDeaf) || (!oldState.serverDeaf && newState.serverDeaf))
        return VoiceUpdateEnum.DEAF;
    else if ((oldState.selfDeaf && !newState.selfDeaf) || (oldState.serverDeaf && !newState.serverDeaf))
        return VoiceUpdateEnum.UNDEAF;    
    else if ((!oldState.selfMute && newState.selfMute) || (!oldState.serverMute && newState.serverMute))
        return VoiceUpdateEnum.MUTE;
    else if ((oldState.selfMute && !newState.selfMute) || (oldState.serverMute && !newState.serverMute))
        return VoiceUpdateEnum.UNMUTE;
    else if (!oldState.streaming && newState.streaming)
        return VoiceUpdateEnum.STARTSTREAM;
    else if (oldState.streaming && !newState.streaming)
        return VoiceUpdateEnum.ENDSTREAM;
    else if (!oldState.selfVideo && newState.selfVideo)
        return VoiceUpdateEnum.STARTVIDEO;
    else if (oldState.selfVideo && !newState.selfVideo)
        return VoiceUpdateEnum.ENDVIDEO;
    else
        return VoiceUpdateEnum.UNKNOWN;
}

function onCD(id){
    if (fartCD.has(id)){
        return true;
    } else {
        fartCD.add(id);
        setTimeout(() => {
            fartCD.delete(id);
        }, 20000);
        return false;
    }
}

async function onJoin(client, oldState, newState){
    let member = newState.member;
    let guild = member.guild;
    let fun = guild.roles.cache.find((role) => role.name === "Unity");

    if (oldState.channelID !== null){
        let channel = await guild.channels.fetch(oldState.channelId);
        if (channel.parentId === client.ServerSettings.voiceCreatorCategoryID && channel.id !== client.ServerSettings.voiceCreatorChannelID && channel.name !== "mods"){
            if (channel.members.size === 0){
                client.VoiceChannelManager.DeleteVoiceChannel(guild, channel.id);
            }
        }
    }

    if (newState.channelId === client.ServerSettings.voiceCreatorChannelID){
        client.VoiceChannelManager.CreateVoiceChannel(guild, member, function(channelID){
            try{
                client.VoiceChannelManager.MoveMember(member, channelID);
            } catch(e){
                console.log("Failed to move member", e);
            }
        });
    }

    return;
    
    if (member.roles.cache.has(fun.id)){
        // if (onCD(member.id)) return; //add internal cooldown so users cant spam the bot joining
        if (member.user.id === "105858401497546752"){ //jangles
            client.VCM.PlaySound(newState.channelId, guild.id, guild.voiceAdapterCreator, "./assets/sounds/hello.mp4", 0);
        } else if (member.user.id === '101755961496076288'){//erne
            client.VCM.PlaySound(newState.channelId, guild.id, guild.voiceAdapterCreator, "./assets/sounds/erne_sus.mp4", 2500);
        } else if (member.user.id === '317753455190081536') { //robin
            client.VCM.PlaySound(newState.channelId, guild.id, guild.voiceAdapterCreator, "./assets/sounds/no.mp3", 2500, false, function(){
                guild.members.fetch(member.user.id).then(member => {
                    // member.voice.setChannel(null);
                });
            });
        } else if (member.user.id === '231605256398569474'){ //christine
            client.VCM.PlaySound(newState.channelId, guild.id, guild.voiceAdapterCreator, "./assets/sounds/do_not_come.mp4", 2500);
        } else if (member.user.id === '132342534641811457'){ //ace
            client.VCM.PlaySound(newState.channelId, guild.id, guild.voiceAdapterCreator, "./assets/sounds/ace_intro.mp4", 2500);
        } else if (member.user.id === '100044596725170176'){ //lorenz
            client.VCM.PlaySound(newState.channelId, guild.id, guild.voiceAdapterCreator, "./assets/sounds/lorenz_intro.mp4", 2500);
        } else if (member.user.id === '477226464740245506'){ //ring
            client.VCM.PlaySound(newState.channelId, guild.id, guild.voiceAdapterCreator, "./assets/sounds/ring_intro.mp4", 2500);
        } else {
            client.VCM.PlaySound(newState.channelId, guild.id, guild.voiceAdapterCreator, "./assets/sounds/kick_your_ass.mp3", 2500);
        }
    }
    console.log(newState.member.user.username + " joined voice");
}

async function onLeave(client, oldState, newState){
    let member = newState.member;
    let guild = member.guild;
    let channel = await guild.channels.fetch(oldState.channelId);
    if (channel.parentId === client.ServerSettings.voiceCreatorCategoryID && channel.id !== client.ServerSettings.voiceCreatorChannelID){
        console.log(channel.members.size);
        if (channel.members.size === 0){
            client.VoiceChannelManager.DeleteVoiceChannel(guild, channel.id);
        }
    }
    console.log(newState.member.user.username + " left");
}

function onMuteDeaf(client, oldState, newState){
    console.log(newState.member.user.username + " muted and deafened");
}

function onUnmuteDeaf(client, oldState, newState){
    console.log(newState.member.user.username + " unmuted and undeafened");
}

function onDeaf(client, oldState, newState){
    console.log(newState.member.user.username + " deafened");
}

function onUndeaf(client, oldState, newState){
    console.log(newState.member.user.username + " undeafened");
}

function onMute(client, oldState, newState){
    console.log(newState.member.user.username + " muted");
}

function onUnmute(client, oldState, newState){
    console.log(newState.member.user.username + " unmuted");
}

function onStartStream(client, oldState, newState){
    return;
    let member = newState.member;
    let guild = member.guild;
    let fun = guild.roles.cache.find((role) => role.name === "Fun");
    if (member.roles.cache.has(fun.id)){
        client.VCM.PlaySound(newState.channelId, guild.id, guild.voiceAdapterCreator, "./assets/sounds/turn_that_off.mp3", 2500);
    }

    console.log(member.user.username + " started stream");
}

function onEndStream(client, oldState, newState){
    console.log(newState.member.user.username + " ended stream");
}

function onStartVideo(client, oldState, newState){
    return;
    let member = newState.member;
    let guild = member.guild;
    let fun = guild.roles.cache.find((role) => role.name === "Fun").id;
    
    if (member.roles.cache.has(fun)){
        // if (onCD(member.id)) return; //add internal cooldown so users cant spam the bot joining

        client.VCM.PlaySound(newState.channelId, guild.id, guild.voiceAdapterCreator, "./assets/sounds/my_eyes.mp4");
    }
    console.log(member.user.username + " started video");
}

function onEndVideo(oldState, newState){
    console.log(newState.member.user.username + " ended video");
}

module.exports = (client, oldState, newState) => {
    if (newState.member.user.bot) return;
    
    let voiceAction = determineVoiceUpdate(oldState, newState);
    switch(voiceAction){
        case 0: onJoin(client, oldState, newState); break;
        case 1: onLeave(client, oldState, newState); break;
        case 2: onMuteDeaf(client, oldState, newState); break;
        case 3: onUnmuteDeaf(client, oldState, newState); break;
        case 4: onDeaf(client, oldState, newState); break;
        case 5: onUndeaf(client, oldState, newState); break;
        case 6: onMute(client, oldState, newState); break;
        case 7: onUnmute(client, oldState, newState); break;
        case 8: onStartStream(client, oldState, newState); break;
        case 9: onEndStream(client, oldState, newState); break;
        case 10: onStartVideo(client, oldState, newState); break;
        case 11: onEndVideo(client, oldState, newState); break;
        default: return;
    }

    return;
}
