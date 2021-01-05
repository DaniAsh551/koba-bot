const { Message, Client } = require("discord.js");
const KEY = "help";
const { createHandler, EVENT_TYPE } = require("../createHandler");

/**
 *
 * @param {{ args:string[], message:Message, config:any, client:Client }} param0
 */
async function help({ args, message, config }) {
  let { prefix } = config;
  return `Hi <@${message.member.user.id}> - You can use the following command as of now:
  \`\`\`${prefix}play [game_tag]  -   Invites all people who have subscribed to play a game.
  ${prefix}games            -   Shows all the games that you can invite people to with the /play command.
  ${prefix}help             -   Displays this help message.\`\`\``;
}

module.exports = createHandler(KEY, help, EVENT_TYPE.MESSAGE);
