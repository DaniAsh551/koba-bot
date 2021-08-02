const { Message, Client, MessageEmbed } = require("discord.js");
const KEY = "lockvoice";
const { createHandler, EVENT_TYPE } = require("../createHandler");
const { getUserProp } = require("../helper");

/**
 *
 * @param {{ args:string[], message:Message, config:any, client:Client }} param0
 */
async function lockVoice({ args, message, config, handlers }) {
  let { prefix } = config;


  //check if user is in voice channel
  if(!message.member.voice.channel)
    return new MessageEmbed()
    .setColor("#0099ff")
    .setTitle(
      `Hi ${getUserProp(
        message.member.user,
        "name"
      )}, You need to be in a Voice channel to use this command.`
    );
    
  console.log(message.member.voice.channel.name);
  return message.member.voice.channel.name;
}

module.exports = createHandler(
  KEY,
  lockVoice,
  EVENT_TYPE.MESSAGE,
  "Locks current voice channel for specified members only."
);
