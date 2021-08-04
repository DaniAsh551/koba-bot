const { Message, Client, MessageEmbed, Guild, Emoji } = require("discord.js");
const { createHandler, EVENT_TYPE } = require("../createHandler");
const { getUserProp } = require("../helper");
const KEY = "quickpoll";

const MAX_OPTIONS = 26;
const emojis = "🇦 🇧 🇨 🇩 🇪 🇫 🇬 🇭 🇮 🇯 🇰 🇱 🇲 🇳 🇴 🇵 🇶 🇷 🇸 🇹 🇺 🇻 🇼 🇽 🇾 🇿".split(' ');

/**
 *
 * @param {{ args:string[], message:Message, config:any, client:Client }} param0
 */
async function quickpoll({ args, message, config, handlers, client }) {
  let { prefix } = config;
  let chunks = message.content.split('|');
  if(chunks.length > 26)
    return "A maximum of 26 options are supported in quickpoll.";

  let remLength = `${prefix}quickpoll `.length;
  chunks[0] = chunks[0].substr(remLength);

  let channel = message.channel;

  let reactions = chunks
    .filter((_,i) => i>0).map((_,i) => getEmoji(i));

  // let response = new MessageEmbed()
  //   .setColor("#0099ff")
  //   .setTitle(
  //     `${getUserProp(
  //       message.member.user,
  //       "name"
  //     )} asks:` + "\n" + chunks[0]
  //   );

  // response.addField(" ",
  //   chunks.filter((_,i) => i>0).map((o,i) => `${reactions[i]} ${o}`).join('\n'));

  let response = `${getUserProp(message.member.user,"mention")} asks:
  *${chunks[0].trimEnd()}*\n` + 
  `${chunks.filter((_,i) => i>0).map((o,i) => `   ${reactions[i]} ${o}`).join('\n')}
  `;

  channel.send(response)
  .then(message => {
      reactions.forEach(r => message.react(r))
  })
  .catch(reason => {});
  message.delete();
}

//get reaction options for poll (A-Z)
function getEmoji(index){
    if(index >= 26)
        return null;

    return emojis[index];
}


module.exports = createHandler(
  KEY,
  quickpoll,
  EVENT_TYPE.MESSAGE,
  `Creates a quick poll. Usage:
   [Question] | Option 1 | Option 2 | ...
   eg: quickpoll Egg or Chicken? | Egg | Chicken`
);
