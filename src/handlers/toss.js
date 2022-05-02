const { Message, Client, MessageAttachment } = require("discord.js");
const { createHandler, EVENT_TYPE } = require("../createHandler");
const { getUserProp } = require("../helper");
const KEY = "toss";

/**
 *
 * @param {{ args:string[], message:Message, config:any, client:Client }} param0
 */
async function toss({ args, message, config, handlers }) {
  
  let toss = "Tossing Coin",
      heads = "Its Heads!",
      tails = "Its Tails!",
      duration = 1500,
      aToss = null,
      aHeads = null,
      aTails = null,
      noAnim = args.length > 0 && args[0].toLowerCase().startsWith("n");

  if(config.coinToss){
    duration = config.coinToss.duration || duration;
    aToss = config.coinToss.toss;
    aHeads = config.coinToss.heads;
    aTails = config.coinToss.tails;
  }

  if(!noAnim && aToss){
    let tossA = new MessageAttachment(aToss);
    setTimeout(() => {
      let isHeads = Math.random() >= 0.5;
      let attachment = 
        isHeads && aHeads 
        ? new MessageAttachment(aHeads)
        : !isHeads && aTails ? new MessageAttachment(aTails) : null;

      message.reply( {content:isHeads ? heads : tails, files: [attachment]});
    }, Math.max(200, duration - 1000));

    message.channel.send(toss, tossA).then(m => {
      setTimeout(() => {
        m.delete();
      }, duration);
    })
    .catch(e => {});
  }else{
    let isHeads = Math.random() >= 0.5;
    message.reply({content:isHeads ? heads : tails});
  }
}

module.exports = createHandler(
  KEY,
  toss,
  EVENT_TYPE.MESSAGE,
  "Toss a coin.\nUsage: toss [noanim:OPTIONAL]"
);
