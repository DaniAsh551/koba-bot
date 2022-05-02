const { Message, Client } = require("discord.js");
const { createHandler, EVENT_TYPE } = require("../createHandler");
const { getUserProp } = require("../helper");
const { getConfig } = require("../config");
const { getDefaultLevelupAttachment, getLevelupAttachment, getLevel } = require("../helpers/level");
const KEY = "level";

/**
 *
 * @param {{ args:string[], message:Message, config:any, client:Client }} param0
 */
async function level({ args, message, config, handlers }) {

  let userId = message.member.user.id;

  let guildId = message.channel.guild.id;
  /**
   * @type {Array<{ userId:string, noOfMsgs:number, level:number }>}
   */
  let memberPoints = getConfig(guildId, "memberPoints.json");
  let userRecordIndex = memberPoints.findIndex(v => v.userId == userId);
  let userRecord = userRecordIndex >= 0 ? memberPoints[userRecordIndex] : { userId, noOfMsgs:0, level: 0 };

  //let origRecord = { ...userRecord };
  let newLvl = getLevel(userRecord.noOfMsgs + 1);
  userRecord.level = newLvl;

  /**
     * @type {Array<{ startLevel:number, banner:string }>}
     */
   let levelupBanners = config.levelupBanners;
    
   let banner = levelupBanners && levelupBanners.length > 1 
     ? levelupBanners.filter(b => b.startLevel <= newLvl)
       .sort((a,b) => a.startLevel - b.startLevel).reverse()[0]
     : levelupBanners && levelupBanners.length > 0 
       ? levelupBanners[0]
       : null;

   (banner 
     ? getLevelupAttachment(message, newLvl, userRecord.noOfMsgs, [ ...memberPoints ], banner.banner)
     : getDefaultLevelupAttachment(message, newLvl, userRecord.noOfMsgs)
   ).then(attachment => message.reply({conten:`${getUserProp(message.member.user, "mention")}, here is your level.`, files: [attachment]}));
}

module.exports = createHandler(
  KEY,
  level,
  EVENT_TYPE.MESSAGE,
  "Displays your level and rank in the guild."
);
