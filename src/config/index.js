const fs = require("fs");
const path = require("path");

/**
 * @type {Array<{ id:string, time:Date, data:any }>}
 */
let _cache = [];

/**
 * Cache manager function - runs every 1min and cleans expired data.
 */
setInterval(function(){
    let currentTime = new Date();
    let valid = _cache.filter(r => r.time > currentTime);
    
    if(valid.length != _cache.length){
        console.debug(`[Cache Manager] Cleaning ${_cache.length - valid.length} expired records.`);
        _cache = valid;
    }
    else
        console.debug("[Cache Manager] No expired data");
}, 60000);

/**
 * Put or retrieve data from memory and disk cache.
 * @param {string} id Identifier of data.
 * @param {any} fallbackId Id for fallback data when the data does not exist.
 * @returns {any}
 */
function cache(id, fallbackId){

    //check if data exists in memory and return if exists.
    let cacheMatches = _cache.filter(r => r.id === id);
    if(cacheMatches.length > 0)
        return cacheMatches[0].data;

    try {
        //check if preferred disk data exists
        if(fs.existsSync(id))
        {
            let val = JSON.parse(fs.readFileSync(id));
            //push to cache with 5 minutes as validity period
            _cache.push({ time: new Date(new Date().getTime() + ( 5 * 60000 )), id, data:val });
            return val;
        }
        else
            //throw that preferred disk data does not exist
            throw `"${id}" not found.`
    } catch (error) {
        //check if required directory structure exists and create if not
        if(!fs.existsSync(path.dirname(id)))
            fs.mkdirSync(path.dirname(id), { recursive: true });

        //check if required disk data file exists and create if not
        if(!fs.existsSync(id))
            fs.writeFileSync(id, fs.readFileSync(fallbackId, { encoding:"utf8" }));
        
        
        let val = JSON.parse(fs.readFileSync(id, { encoding:"utf8" }));
        //push to cache with 5 minutes as validity period
        _cache.push({ time: new Date(new Date().getTime() + ( 5 * 60000 )), id, data:val });
        return val;
    }
}

/**
 * Gets a given JSON data file for the guild.
 * @param {string} guildId 
 * @param {string} fileName 
 * @returns {any}
 */
function getConfig(guildId, fileName){
    //guild specific file Id
    let id = path.join(__dirname, guildId, fileName);
    //fallback file Id
    let fallbackId = path.join(__dirname, "default", fileName);
    return cache(id, fallbackId);
};

/**
 * Gets the config for a given guild
 * @param {string} guildId 
 */
module.exports.appConfig = function(guildId){
    return getConfig(guildId, "app.json");
}

module.exports.getConfig =  getConfig;
module.exports.default = getConfig;