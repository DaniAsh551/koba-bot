const { Message } = require("discord.js");
const { getUserProp, getRandom } = require("../../helper");
const { writableConfig } = require("../../config");
const { getDefaultLevelupAttachment, getLevelupAttachment, getLevel } = require("../../helpers/level");

/**
 * Handles member points.
 * @param {{ message:Message, config:any }} param0 
 */
module.exports = async function({ message, config }){

    //ignore bots
    if(message.member.user.bot)
        return;

    let userId = message.member.user.id;

    let guildId = message.channel.guild.id;
    /**
     * @type {Array<{ userId:string, noOfMsgs:number, level:number }>}
     */
    let memberPoints = writableConfig(guildId, "memberPoints.json");
    let userRecordIndex = memberPoints.findIndex(v => v.userId == userId);
    let userRecord = userRecordIndex >= 0 ? memberPoints[userRecordIndex] : null;;

    if(!userRecord){
        userRecord = { userId, noOfMsgs:1, level: 0 };
        memberPoints.push(userRecord);
        return;
    }

    //let origRecord = { ...userRecord };
    let newLvl = getLevel(userRecord.noOfMsgs + 1);
    userRecord.noOfMsgs += 1;
    //skip if lvl is same as before
    if(userRecord.level >= newLvl)
        return;

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
    ).then(attachment => message.channel.send(`Congratulations ${getUserProp(message.member.user, "mention")}! You are now level ${newLvl}`, attachment));
    
    // let attachment = banner 
    //   ? await getLevelupAttachment(message, newLvl, userRecord.noOfMsgs, [ ...memberPoints ], banner.banner)
    //   : await getDefaultLevelupAttachment(message, newLvl, userRecord.noOfMsgs);

    // message.channel.send(`Congratulations ${getUserProp(message.member.user, "mention")}! You are now level ${newLvl}`, attachment);
};

//helper-functions below
