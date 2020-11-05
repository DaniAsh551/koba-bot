const { Message } = require("discord.js");
const KEY = "games";

/**
 *
 * @param {{ args:string[], message:Message, config:any }} param0
 */
async function games({ args, message, config }) {
  let games = config.play.games
    .map((g) => `${g.name}:  Tags '${g.tags.join(", ")}' supported.`)
    .join("\n");
  return `Hi <@${message.member.user.id}> - The list of games we officialy support as of now:
  ${games}
  example: '${config.prefix}play ${games[0].tags[0]}' invites people to a game of ${games[0].name}`;
}

module.exports = { KEY, games };
