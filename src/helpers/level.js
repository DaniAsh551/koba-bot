const { Message, MessageAttachment, Guild } = require("discord.js");
const { Canvas, CanvasRenderingContext2D,loadImage } = require("node-canvas");
const { getConfig } = require("../config");
const Colors = require("../colors.json");
const path = require("path");

const MAX_LVL = 500;
const LVL_MAP = Array.from(Array(500)).map((_,i) => Math.pow(i+1, 2) * 10);

/**
 * 
 * @param {Message} message 
 * @param {number} level 
 * @param {number} noOfMessages 
 * @param {Array<{ userId:string, noOfMsgs:number, level:number }>} memberPoints
 * @param {string|undefined|null} bannerId 
 */
 async function getLevelupAttachment(message, level, noOfMessages, memberPoints, bannerId){
    if(!bannerId)
      return await getDefaultLevelupAttachment(message, level, noOfMessages);
    /**
     * @type {Array<{ id: string,unitPrecision: string,size: { w: number,h: number },background: string,userAvatar: { shape: string,x: number,y: number,w: number,h: number },userName: { x: number,y: number,fontFamily: string,fontSize: string,fontColor: string,drawType: string },userTag: { x: number,y: number,fontFamily: string,fontSize: string,fontColor: string,drawType: string },currentLevel: { x: number,y: number,fontSize: string,fontColor: string,fontFamily: string,drawType: string },nextLevel: { x: number,y: number,fontSize: string,fontColor: string,fontFamily: string,drawType: string },progressBar: { shape: string,x: number,y: number,w: number,h: number,source: string },progressBarText: { x: number,y: number,fontFamily: string,fontSize: string,fontColor: string,drawType: string },totalPoints: { x: number,y: number,fontFamily: string,fontSize: string,fontColor: string,drawType: string },rankText: { x: number,y: number,fontFamily: string,fontSize: string,fontColor: string,drawType: string },guildIcon: { x: number,y: number,w: number,h: number },postRenderAdditions: Array<{ x: number,y: number,w: number,h: number,source: string }>,preRenderAdditions: Array<{ x: number,y: number,w: number,h: number,source: string }> }>}
     */
    let bannerConf = getConfig(message.channel.guild.id, "levelupBanners.json");
    let banner = bannerConf.find(c => c.id == bannerId);
    if(!banner)
      return await getDefaultLevelupAttachment(message, level, noOfMessages);
  
    /**
     * @type {Guild}
     */
     let guild = message.channel.guild;
  
    let canvas = new Canvas(banner.size.w, banner.size.h);
    let ctx = canvas.getContext('2d');
  
    let bg = await loadImage(banner.background);
    ctx.drawImage(bg, 0, 0, bg.width, bg.height, 0, 0, canvas.width, canvas.height);
  
    /** DRAW ALL IMAGES */
    //pre render additions
    if(banner.preRenderAdditions && banner.preRenderAdditions.length > 0){
      for(let i = 0; i < banner.preRenderAdditions.length; ++i){
        let addition = banner.preRenderAdditions[i];
        let img = await loadImage(addition.source);
        drawImage(ctx, img, addition);
      }
    }
  
    //draw user avatar
    if(banner.userAvatar){
      let avatar = await loadImage(message.member.user.displayAvatarURL({ format: 'jpg' }));
      drawImage(ctx, avatar, banner.userAvatar);
    }
    
    //draw guild icon
    if(banner.guildIcon){
      let guildIcon = await loadImage(guild.iconURL({ format: 'jpg' }));
      drawImage(ctx, guildIcon, banner.guildIcon);
    }
    /** /DRAW ALL IMAGES */
  
    let progress = getPercentageComplete(level, noOfMessages, true);
    //draw progress bar
    if(banner.progressBar){
      let progressBar = await loadImage(banner.progressBar.source);
      let w = Math.round(progress.perc / 100.0 * progressBar.width);
  
      ctx.drawImage(progressBar, 0, 0, progressBar.width, progressBar.height, banner.progressBar.x, banner.progressBar.y, w, banner.progressBar.h);
    }
  
    /** DRAW ALL TEXT */
    //draw progress text
    if(banner.progressBarText){
      let progressText = `${progress.score} / ${progress.nextLvlReq} XP`;
      drawText(ctx, progressText, banner.progressText);
    }
  
    //draw user tag
    if(banner.userTag){
      let userTag = message.member.user.tag;
      drawText(ctx, userTag, banner.userTag);
    }
  
    //draw user name
    if(banner.userName){
      let userName = getUserProp(message.member.user, "name");
      drawText(ctx, userName, banner.userName);
    }
  
    //current Lvl
    if(banner.currentLevel){
      drawText(ctx, level, banner.currentLevel);
    }
    
    //next Lvl
    if(banner.nextLevel){
      let nextLevel = Math.min(level+1, MAX_LVL);
      drawText(ctx, nextLevel, banner.nextLevel);
    }
    
    //draw total points text
    if(banner.totalPoints){
      let points = `${noOfMessages} XP`;
      drawText(ctx, points, banner.totalPoints);
    }
  
    //draw rank
    if(banner.rankText){
      let rank = memberPoints.length < 2 
      ? 1 
      : (memberPoints.sort((a,b) => a.noOfMsgs - b.noOfMsgs).findIndex(p => p.userId === message.member.user.id) + 1);
      let rankText = `#${rank}`;
      
      drawText(ctx, rankText, banner.rankText);
    }
  
    /** /DRAW ALL TEXT */
  
    //post render additions
    if(banner.postRenderAdditions && banner.postRenderAdditions.length > 0){
      for(let i = 0; i < banner.postRenderAdditions.length; ++i){
        let addition = banner.postRenderAdditions[i];
        let img = await loadImage(addition.source);
        drawImage(ctx, img, addition);
      }
    }
  
    return new MessageAttachment(canvas.toBuffer(), "lvlup.png");
  }
  
  /**
   * Draw text on a given context.
   * @param {CanvasRenderingContext2D} ctx 
   * @param {string} text 
   * @param {{ x: number,y: number,fontFamily: string,fontSize: string,fontColor: string,drawType: string }} options 
   */
  function drawText(ctx, text, options){
    if(!options)
      return;
    ctx.save();
      ctx.font = `${options.fontSize} ${options.fontFamily}`;
      switch(options.drawType){
        case "stroke":
          ctx.strokeStyle = options.fontColor;
          ctx.strokeText(text, options.x, options.y);
        default:
          ctx.fillStyle = options.fontColor;
          ctx.fillText(text, options.x, options.y);
      }
      ctx.restore();
  }
  
  /**
   * Draws a given image according to the supplied options.
   * @param {CanvasRenderingContext2D} ctx 
   * @param {{ shape: string,x: number,y: number,w: number,h: number }} options 
   */
  function drawImage(ctx, image, options){
    if(!options)
      return;
  
    if(options.shape == "circle")
      drawRoundImage(ctx, image, options.x, options.y, options.w, options.h);
    else{
      ctx.drawImage(image, 0, 0, image.width, image.height, options.x, options.y, options.w, options.h);
    }
  }
  
  /**
   * Get the default levelup attachment/image
   * @param {Message} message 
   * @param {number} level 
   * @param {number} noOfMessages 
   * @returns {MessageAttachment}
   */
  async function getDefaultLevelupAttachment(message, level, noOfMessages){
    let canvas = new Canvas(400, 200, "image");
    let ctx = canvas.getContext('2d');
  
    let avatar = await loadImage(message.member.user.displayAvatarURL({ format: 'jpg' }));
    let kbBotAvatar = await loadImage(path.join(process.cwd(), "src", "avatar.png"));
  
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, Colors.black.hex);
    gradient.addColorStop(1.0, Colors.blue_gray.hex);
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0, canvas.width, canvas.height);
    
    gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "magenta");
    gradient.addColorStop(0.5, "blue");
    gradient.addColorStop(1.0, "red");
    ctx.fillStyle = gradient;
  
    drawRoundImage(ctx, avatar, 20, 20, canvas.height - 40, canvas.height - 40);
    
    drawRoundImage(ctx, kbBotAvatar, (canvas.width / 4 - 25) + (canvas.width / 2), canvas.height / 4, 50, 50);
    
    ctx.font = "35px Verdana";
    
    let strSize = ctx.measureText(`LVL ${newLvl}`);
    ctx.fillText(`LVL ${newLvl}`, (canvas.width / 4 - strSize.width/2) + (canvas.width / 2), (canvas.height / 4) * 2.6 + (strSize.actualBoundingBoxAscent + strSize.actualBoundingBoxDescent) / 2);
  
    return new MessageAttachment(canvas.toBuffer(), "lvlup.png");
  }
  
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
    let nextLvlReq = LVL_MAP[Math.min(level, MAX_LVL - 1)];
    let lvlReq = LVL_MAP[Math.max(level - 1,0)];
  
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

  module.exports.getLevelupAttachment = getLevelupAttachment;
  module.exports.drawText = drawText;
  module.exports.drawImage = drawImage;
  module.exports.getDefaultLevelupAttachment = getDefaultLevelupAttachment;
  module.exports.getLevel = getLevel;
  module.exports.roundRect = roundRect;
  module.exports.drawRoundImage = drawRoundImage;