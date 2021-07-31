const { Message, Client, MessageEmbed } = require("discord.js");
const crypto = require('crypto-js');
const KEY = "login";
const { createHandler, EVENT_TYPE } = require("../createHandler");
const { getUserProp } = require("../helper");
const nonce = () => global.NONCE;

/**
 *
 * @param {{ args:string[], message:Message, config:any, client:Client }} param0
 */
async function login({ args, message, config, handlers }) {
  let { prefix } = config;

  if(args.length > 0)
  {
    let dec = crypto.AES.decrypt(args[0], nonce(),
      {
        mode: crypto.mode.CBC,
        padding: crypto.pad.Pkcs7
     });
    return dec.toString(crypto.enc.Utf8);
  }

  let member = message.member;
  if(!member.hasPermission("ADMINISTRATOR") && !member.hasPermission("MANAGE_GUILD"))
    return "You do not have permission for this action.";

  let token = {
    guild: message.guild.id,
    user: message.member.user.id,
    createTime: new Date(),
  };

  //add 24 hrs
  token.expireTime = new Date(token.createTime.getTime() + (60*60*1000)).toISOString();
  token.createTime = token.createTime.toISOString();
  let tokenString = crypto.AES.encrypt(
    JSON.stringify(token),
     nonce(),
     {
        mode: crypto.mode.CBC,
        padding: crypto.pad.Pkcs7
     }
     );

  let embed = new MessageEmbed()
    .setColor("#0099ff")
    .setTitle(
      `Hi ${getUserProp(
        message.member.user,
        "name"
      )}, your login token is "${tokenString}"`
    );

  let fields = Object.keys(handlers).map((key) => ({
    name: `${prefix}${handlers[key].KEY}`,
    value: handlers[key].description,
  }));

  embed.addFields(fields);
  return embed;
}

module.exports = createHandler(
  KEY,
  login,
  EVENT_TYPE.MESSAGE,
  "Generates a token for WebUI"
);
