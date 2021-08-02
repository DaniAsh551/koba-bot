const { Message, Client, MessageEmbed } = require("discord.js");
const { createHandler, EVENT_TYPE } = require("../createHandler");
const {getConfig} = require("../config");
const {getUserProp} = require("../helper");
const colors = require("../colors.json");
const KEY = "games";

/**
 * Spits out the list of supported games.
 * @param {{ args:string[], message:Message, config:any, client: Client }} param0
 */
async function games({ args, message, config }) {
  let playConfig = getConfig(message.channel.guild.id, "play.json");
  let gameNames = playConfig.games.map(g => g.name).sort();
  let games = gameNames.map(name => playConfig.games.filter(g => g.name == name)[0]).filter(x => x);

  let embed = new MessageEmbed()
    .setColor(colors.blue_crayola.hex)
    .setTitle(
      `Hi ${getUserProp(
        message.member.user,
        "name"
      )}! The list of games officialy supported on this Guild as of now:`
    );

  let fields = games.map((g) => ({
    name: g.name,
    value: `Supported tags:
        ${g.tags.map(t => `    - ${t}`).join('\r\n')}
        
        `,
  }));

  embed.addFields(fields);
  return embed;
}

module.exports = createHandler(
  KEY,
  games,
  EVENT_TYPE.MESSAGE,
  "Spits out the list of supported games."
);
