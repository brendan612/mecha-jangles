exports.run = (client, message, [channelId]) => {
    const guild = message.guild;
    const channel = message.member.voice.channel;
    const textChannel = message.channel;
    const member = message.member;

    // let erne = guild.roles.cache.find((role) => role.name === "Erne").id;
    // let admin = guild.roles.cache.find((role) => role.name === "Admin").id;
    // let mod = guild.roles.cache.find((role) => role.name === "Moderator").id;
    // let id = '231605256398569474'; 
    if (true){
        message.delete();

        let snapChannel = (channelId !== undefined && channelId !== null) ? guild.channels.cache.find(channelId) : channel;
        let memberCount = snapChannel.members.size;

        let kickedMembers = [];
        let members = [];
        snapChannel.members.forEach(x => members.push(x));

        for (let i = 0; i < snapChannel.members.size; i++){
            if (memberCount <= (snapChannel.members.size / 2)){
                break;
            }
 
            let index = Math.floor(Math.random()*memberCount);
            while(kickedMembers.includes(members[index])){
                index = Math.floor(Math.random()*memberCount);
            }
            var toKick = members[index];
            kickedMembers.push(toKick);
            memberCount--;
        }

        client.VCM.PlaySound(snapChannel.id, guild.id, guild.voiceAdapterCreator, '../bot/assets/sounds/im_going_to_enjoy_it.mp4', 0, false, function(){
            for(let kicked of kickedMembers){
                textChannel.send(kicked.user.username + " was snapped out of existence.");
                guild.members.fetch(kicked.user.id).then(member => {
                    member.voice.setChannel(null);
                });
            }
        });
    }
}