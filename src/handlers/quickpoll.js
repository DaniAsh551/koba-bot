const { Message, Client, MessageEmbed } = require("discord.js");
const { createHandler, EVENT_TYPE } = require("../createHandler");
const { getUserProp } = require("../helper");
const KEY = "quickpoll";

const MAX_OPTIONS = 26;

/**
 *
 * @param {{ args:string[], message:Message, config:any, client:Client }} param0
 */
async function quickpoll({ args, message, config, handlers }) {
  let { prefix } = config;
  let chunks = message.content.split('|');
  if(chunks.length > 26)
    return "A maximum of 26 options are supported in quickpoll.";

  let remLength = `${prefix}quickpoll `.length;
  chunks[0] = chunks[0].substr(remLength);

  let channel = message.channel;
  let reactions = chunks
    .filter((_,i) => i>0).map((_,i) => getReaction(i));

  let embed = new MessageEmbed()
    .setColor("#0099ff")
    .setTitle(
      `${getUserProp(
        message.member.user,
        "mention"
      )} asks:
      ${chunks[0]}

      ${chunks.filter((_,i) => i>0).map((o,i) => `${reactions[i]} ${o}`)}
      `
    );
    
  channel.send(embed)
  .then(message => {
      reactions.forEach(r => message.react(r))
  })
  .catch(reason => {});
}

//get reaction options for poll (A-Z)
function getReaction(index){
    if(index >= 26)
        return null;

    const reactions = Array.from(Array(26)).map(i => String.fromCharCode(97 + i))
    .map(c => `:regional_indicator_${c}:`);
    return reactions[index];
}

module.exports = createHandler(
  KEY,
  quickpoll,
  EVENT_TYPE.MESSAGE,
  `Creates a quick poll. Usage:
   [Question] | Option 1 | Option 2 | ...
   eg: quickpoll Egg or Chicken? | Egg | Chicken`
);
