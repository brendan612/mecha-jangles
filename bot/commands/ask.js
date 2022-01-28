exports.run = (client, message) => {
    const guild = message.guild;
    const channel = message.member.voice.channel;
    const member = message.member;

    // let erne = guild.roles.cache.find((role) => role.name === "Erne").id;
    // let admin = guild.roles.cache.find((role) => role.name === "Admin").id;
    // let mod = guild.roles.cache.find((role) => role.name === "Moderator").id;
    // let id = '231605256398569474'; 
    if (true){
        message.delete();

        client.VCM.PlaySound(channel.id, guild.id, guild.voiceAdapterCreator, '../bot/assets/sounds/any_askers.mp4', 0, false, function(){
        });
    }
}