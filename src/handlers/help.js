const { Message } = require("discord.js");
const KEY = "help";

/**
 *
 * @param {{ args:string[], message:Message, config:any }} param0
 */
async function help({ args, message, config }) {
  return `Hi <@${message.member.user.id}> - You can use the following command as of now:
  /play [game]  -   Invites all people who have subscribed to play a game
  /help         -   Displays this message`;
}

module.exports = { KEY, help };
