const { Message, Client } = require("discord.js");
const KEY = "games";
const { createHandler, EVENT_TYPE } = require("../createHandler");

/**
 * Spits out the list of supported games.
 * @param {{ args:string[], message:Message, config:any, client: Client }} param0
 */
async function games({ args, message, config }) {
  let games = config.play.games;
  let game_help = games
    .map((g) => `\n${g.name}:  Tags '${g.tags.join(", ")}' supported.`)
    .join("\n");
  return `Hi <@${message.member.user.id}> - The list of games we officialy support as of now:
  \`\`\`${game_help}\`\`\`
  example: \`\`\`${config.prefix}play ${games[0].tags[0]}\`\`\` invites people to a game of ${games[0].name}`;
}

module.exports = createHandler(
  KEY,
  games,
  EVENT_TYPE.MESSAGE,
  "Spits out the list of supported games."
);
