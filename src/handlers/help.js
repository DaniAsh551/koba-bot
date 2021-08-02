const { Message, Client, MessageEmbed } = require("discord.js");
const KEY = "help";
const { createHandler, EVENT_TYPE } = require("../createHandler");
const { getUserProp } = require("../helper");

/**
 *
 * @param {{ args:string[], message:Message, config:any, client:Client }} param0
 */
async function help({ args, message, config, handlers }) {
  let { prefix } = config;

  let embed = new MessageEmbed()
    .setColor("#0099ff")
    .setTitle(
      `Hi ${getUserProp(
        message.member.user,
        "name"
      )}, You can use the following command as of now:`
    );

  let fields = Object.keys(handlers).sort().map((key) => ({
    name: `${prefix}${handlers[key].KEY}`,
    value: handlers[key].description,
  }));

  embed.addFields(fields);
  return embed;
}

module.exports = createHandler(
  KEY,
  help,
  EVENT_TYPE.MESSAGE,
  "Displays the help message."
);
