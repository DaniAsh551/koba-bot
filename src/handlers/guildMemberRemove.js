const { Client, GuildMember, TextChannel } = require("discord.js");
const { createHandler, EVENT_TYPE } = require("../createHandler");
const { getUserProp, getRandom } = require("../helper");
const {getConfig} = require("../config");
const KEY = "guildMemberRemove";

const userPropRegex = /({user\.([^}]*))(})/gm;

/**
 *
 * @param {{ args:Array<GuildMember>, config:any, client:Client }} param0
 */
async function guildMemberRemove({  args, client }) {

  /**
   * @type {GuildMember}
   */
  let member = args[0];
  if(!member)
  return;

  let guild = member.guild;
  if(!guild)
  return;

  //get config
  let config = getConfig(guild.id, "app.json");
  let { exitMessageChannel } = config;
  //get only numeric values
  exitMessageChannel = exitMessageChannel.replace(/\D*/gm, '');

  //if exitMessageChannel is not defined, let the owner know.
  if(!exitMessageChannel)
  {
    guild.owner.createDM(true)
    .then(dm => dm.send(`Exit Message channel not defined in "${member.guild.name}".`).catch(e => {}))
    .catch(e => {});
    return;
  }

  let messages = config.memberExitMessages || [ "Bye {user.mention}." ];
  let message = getRandom(messages);
  let userProps = message.match(userPropRegex);

  if (userProps && userProps.length)
  {
    let {user} = member;
    userProps.forEach((m) => {
      let prop = m.replace("{user.", "").replace("}", "");
      let val = getUserProp(user, prop);
      message = message.replace(m, val);
    });
  }

  /**
   * @type {TextChannel}
   */
  let channel = guild.channels.cache.find(channel => channel.id === exitMessageChannel);
  
  if(!channel)
  {
    guild.owner.createDM(true)
    .then(dm => dm.send(`Exit Message channel not found in "${member.guild.name}".`).catch(e => {}))
    .catch(e => {});
    return;
  }

  if(!channel.isText()){
    guild.owner.createDM(true)
    .then(dm => dm.send(`Exit Message channel not a text channel in "${member.guild.name}".`).catch(e => {}))
    .catch(e => {});
    return;
  }

  channel.send(message);
}

module.exports = createHandler(
  KEY,
  guildMemberRemove,
  EVENT_TYPE.EVENT,
  "Handles the event when a member leaves the guild."
);
