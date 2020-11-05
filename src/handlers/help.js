const { Message } = require("discord.js");
const KEY = "help";

/**
 *
 * @param {{ args:string[], message:Message, config:any }} param0
 */
async function help({ args, message, config }) {
  let { prefix } = config;
  return `Hi <@${message.member.user.id}> - You can use the following command as of now:
  ${prefix}play [game_tag]  -   Invites all people who have subscribed to play a game.
  ${prefix}games            -   Shows all the games that you can invite people to with the /play command.
  ${prefix}help             -   Displays this help message.`;
}

module.exports = { KEY, help };
