const { Client, GuildMember, TextChannel, Message } = require("discord.js");
const { createHandler, EVENT_TYPE } = require("../createHandler");
const { getUserProp, getRandom } = require("../helper");
const {getConfig} = require("../config");
const fs = require("fs");
const path = require("path");
const KEY = "messageCreate";

/**
 * Ghost handler to manage all other message driven events.
 * @param {{ args:Array<Message>, client:Client, handlers:Array<(any) => any>}} param0
 */
async function messageCreate({  args, client, handlers }) {
    
    //get guild config
    let config = getConfig(args[0].channel.guild.id, "app.json");
    //Get all handlers in 'message' directory and invoke them
    let messageHandlersDir = path.join(__dirname, "message");
    fs.readdirSync(messageHandlersDir)
    .forEach(function (file) {
        /**
         * @type {(any) => void}
         */
        let handlerFunc = require(path.join(messageHandlersDir, file));
        
        if(typeof(handlerFunc) === 'function'){
            handlerFunc({ message:args[0], client, handlers, config });
        }
    });
}

module.exports = createHandler(
  KEY,
  messageCreate,
  EVENT_TYPE.EVENT,
  "Ghost handler to manage all other message driven events."
);
