const { Client, GuildMember, TextChannel, Message, MessageAttachment, MessageEmbed } = require("discord.js");
const { getUserProp, getRandom } = require("../../helper");
const {getConfig, writableConfig } = require("../../config");
const { Canvas,Image,CanvasRenderingContext2D,loadImage } = require("node-canvas");
const Colors = require("../../colors.json");
const path = require("path");

const MAX_LVL = 500;
const LVL_MAP = Array.from(Array(500)).map((_,i) => Math.pow(i+1, 2) * 10);

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
    let canvas = new Canvas(400, 200, "image");
    let ctx = canvas.getContext('2d');

    
    let avatar = await loadImage(message.member.user.displayAvatarURL({ format: 'jpg' }));
    let kbBotAvatar = await loadImage(path.join(process.cwd(), "src", "avatar.png"));

    let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, Colors.black.hex);
    gradient.addColorStop(0.5, Colors.blue_gray.hex);
    gradient.addColorStop(1.0, Colors.golden_yellow.hex);
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0, canvas.width, canvas.height);
    
    gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "magenta");
    gradient.addColorStop(0.5, "blue");
    gradient.addColorStop(1.0, "red");
    ctx.fillStyle = gradient;
    //roundRect(ctx, 10, 10, canvas.height - 20, canvas.height - 20, 15, true, false);
    //ctx.fillRect(10, 10, canvas.height - 20, canvas.height - 20);

    //ctx.drawImage(avatar, 0, 0, avatar.width, avatar.height, 20, 20, canvas.height - 40, canvas.height - 40);
    drawRoundImage(ctx, avatar, 20, 20, canvas.height - 40, canvas.height - 40);
    
    //ctx.drawImage(kbBotAvatar, 0, 0, kbBotAvatar.width, kbBotAvatar.height, (canvas.width / 4 - 25) + (canvas.width / 2), canvas.height / 4 + 25, 50, 50);
    drawRoundImage(ctx, kbBotAvatar, (canvas.width / 4 - 25) + (canvas.width / 2), canvas.height / 4, 50, 50);
    
    ctx.font = "35px Verdana";
    
    let strSize = ctx.measureText(`LVL ${newLvl}`);
    ctx.fillText(`LVL ${newLvl}`, (canvas.width / 4 - strSize.width/2) + (canvas.width / 2), (canvas.height / 4) * 2.6 + (strSize.actualBoundingBoxAscent + strSize.actualBoundingBoxDescent) / 2);

    let attachment = new MessageAttachment(canvas.toBuffer(), "lvlup.png");
    message.channel.send(`Congratulations ${getUserProp(message.member.user, "mention")}! You are now level ${newLvl}`, attachment);
    // avatar.onload = function(){
    // };
};

/**
 * Gets the level of user based on the number of messages sent - caps at lvl 500
 * @param {number} noOfMsgs 
 * @returns {number}
 */
function getLevel(noOfMsgs){
    if(noOfMsgs < LVL_MAP[0])
        return 0;
    let pointCat =  LVL_MAP.filter(x => x <= noOfMsgs).reduce((a,b) => a > b ? a : b);
    return LVL_MAP.indexOf(pointCat) + 1;
}

/**
 * Calculate the progress percentage complete to the next level.
 * @param {number} level Current Level
 * @param {number} noOfMsgs
 * @param {boolean} forProgressBar Indicates whether this is for a progressbar
 * @returns {number|{ lvlReq:number, score:number, nextLvlReq:number, perc:number }}
 */
function getPercentageComplete(level, noOfMsgs, forProgressBar = false){
    let nextLvlReq = LVL_MAP[Math.min(level + 1, MAX_LVL - 1)];
    let lvlReq = LVL_MAP[Math.max(level,0)];

    let lvlDiff = nextLvlReq - lvlReq;
    let score = noOfMsgs - lvlReq;

    let perc = score / lvlDiff * 100.0;

    if(forProgressBar)
        return {lvlReq, score, nextLvlReq, perc};

    return perc;
}

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * Source: https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-using-html-canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object 
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
 function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === 'undefined') {
      stroke = true;
    }
    if (typeof radius === 'undefined') {
      radius = 5;
    }
    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
      var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
  
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {*} image 
 * @param {*} x 
 * @param {*} y 
 * @param {*} w 
 * @param {*} h 
 */
function drawRoundImage(ctx, image, x, y, w, h) {
    let tmpCanvas = new Canvas(w,h);
    let tmpCtx = tmpCanvas.getContext('2d');

    tmpCtx.save();
    tmpCtx.beginPath();
    tmpCtx.arc(w/2-2, w/2-2, w/2-2, 0, Math.PI * 2, true);
    tmpCtx.closePath();
    tmpCtx.clip();
    tmpCtx.drawImage(image, 0, 0, w, h);
    tmpCtx.beginPath();
    tmpCtx.arc(0, 0, 2, 0, Math.PI*2, true);
    tmpCtx.clip();
    tmpCtx.closePath();
    tmpCtx.restore();

    ctx.drawImage(tmpCanvas, x,y);
}