const { Message, Client, MessageEmbed, Guild } = require("discord.js");
const { createHandler, EVENT_TYPE } = require("../createHandler");
const { getUserProp } = require("../helper");
const colors = require("../colors.json");
const KEY = "privatize";

/**
 *
 * @param {{ args:string[], message:Message, config:any, client:Client }} param0
 */
async function privatize({ args, message, config, handlers }) {
  let { prefix } = config;
  /**
   * @type {Guild}
   */
  let guild = message.channel.guild;


  //check if user is in voice channel
  let voiceChannel = message.member.voice.channel;
  if(!voiceChannel){
    message.delete();
    return new MessageEmbed()
    .setColor(colors.red.hex)
    .setTitle(
      `You need to be in a Voice channel to use this command.`
    );
  }

  //check if this channel can be privatized
  let vcName = voiceChannel.name.replace(c => /[^a-z]/gi, '').toLowerCase();
  if(!vcName.endsWith('private'))
  {
    message.delete();
    return new MessageEmbed()
    .setColor(colors.red.hex)
    .setTitle(
      `The voice channel "${voiceChannel.name}" cannot be privatized.`
    );
  }

  //ban everyone else from channel for the timebeing
  let allowedMembers = [ message.member.id, ...message.mentions.members.map(x => x.id), ...message.mentions.roles.map(x => x.id) ]
  //filter repeated values  
  .filter((v,i,s) => s.indexOf(v) === i);

  if(allowedMembers.length < 2)
  {
    message.delete();

    return new MessageEmbed()
    .setColor(colors.sea_green.hex)
    .setTitle(
      `Cannot privatize for just one person.`
    );
  }

  voiceChannel.overwritePermissions([
    {
      id: guild.roles.everyone.id,
      deny: [ 'VIEW_CHANNEL', 'CONNECT' ]
    },
    ...allowedMembers.map(u => ({ id: u, allow: [ 'VIEW_CHANNEL', 'CONNECT' ] }))
  ], "Privatizing Voice channel")
  //continue on successful permission override
  .then(() => {
    message.member.createDM(true).then(dm => dm.send(
      new MessageEmbed()
        .setColor(colors.sea_green.hex)
        .setTitle(
          `Hi ${getUserProp(
            message.member.user,
            "name"
          )}, The channel "${message.channel.name}" in "${guild.name}" guild is now privatized. Privatization would last until every member disconnects, at which point the channel will become available to everyone.`
        )
    ))
    //swallow errors in creating DMs
    .catch(e => {});

    //Restore channel to defaults when everyone disconnects
    const restoreCheckInterval = 30000;
    let restoreFunc = () => {
      if(!voiceChannel.members.size)
        voiceChannel.overwritePermissions([
          {
            id: guild.roles.everyone.id,
            allow: [ 'VIEW_CHANNEL', 'CONNECT' ]
          }
        ], "De-Privatizing Voice channel")
        .catch(rej => {
          //message admins on error
          guild.members.fetch()
          .then(members => {
            Array.from(members.values()).filter(member => member.hasPermission("ADMINISTRATOR"))
            .forEach(admin => admin.createDM(true)
            .then(dm => dm.send(`A problem occured while trying to 'Deprivatize' the voice channel '${voiceChannel.name}' in '${guild.name}'. Please reset the permisssions manually.`))
            //swallow errors
            .catch(e => {}))
          })
          //swallow errors
          .catch((e) => {});
        })
        ;
      else
        setTimeout(restoreFunc, restoreCheckInterval);
    };

    restoreFunc();
    message.delete();
  })
  //on fail
  .catch(ex => {
    //Ask for permissions if not granted
    if(ex.httpStatus === 403)
      message.channel.send(new MessageEmbed()
        .setColor(colors.orange_red.hex)
        .setTitle(
          `I do not have the necessary permissions to do this. Please grant me those permissions or make me an admin.`
        ));

    message.delete();
  });
}

module.exports = createHandler(
  KEY,
  privatize,
  EVENT_TYPE.MESSAGE,
  `Locks current voice channel for specified members only.
   Usage: [Space Seperated List of mentions for allowed members and roles]`
);
