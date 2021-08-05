const fs = require("fs");
const path = require("path");
const { default:JsonProxy } = require("json-data-proxy");

/**
 * @type {Array<{ id:string, time:Date, data:any }>}
 */
let _cache = [];
/**
 * @type { Array<{ id:string, time:Date, data:JsonProxy<any> }> }
 * Keeps track of all the JsonProxies active.
 * NOTE: time is last accessed time + validity period.
 */
let _proxies_cache = [];

/**
 * Cache manager function - runs every 1min and cleans expired data.
 */
setInterval(function(){
    //regular cache
    (() => {
        let currentTime = new Date();
        let valid = _cache.filter(r => r.time > currentTime);
        
        if(valid.length != _cache.length){
            console.debug(`[Cache Manager] Cleaning ${_cache.length - valid.length} expired records.`);
            _cache = valid;
        }
        else
            console.debug("[Cache Manager] No expired data");
    })();
    //proxies cache
    (() => {
        let currentTime = new Date();
        let validIndices = _proxies_cache.map((r,i) => r.time > currentTime ? i : null).filter(i => i);

        if(validIndices.length < _proxies_cache.length){
            let invalids = _proxies_cache.filter((r,i) => !validIndices.includes(i));
            invalids.forEach(c => c.data.destroy());
            console.debug(`[Cache Manager] Cleaning ${invalids.length} expired proxies.`);
            _proxies_cache = validIndices.map(i => _proxies_cache[i]);
        }else
            console.debug("[Cache Manager] No expired proxies");
    })();
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

        //check if required disk data file exists and copy from default if not
        if(!fs.existsSync(id))
            fs.writeFileSync(id, fs.readFileSync(fallbackId, { encoding:"utf8" }));
        
        //read from newly commited file
        let val = JSON.parse(fs.readFileSync(id, { encoding:"utf8" }));
        //push to cache with 5 minutes as validity period
        _cache.push({ time: new Date(new Date().getTime() + ( 5 * 60000 )), id, data:val });
        return val;
    }
}

/**
 * Gets a given JSON data file for the guild (readonly).
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
 * Gets a given JSON data file for the guild (writable Proxy).
 * NOTE: any changes will only be visible to the readonly versions once the cache is updated (automatically in given time).
 * @param {string} guildId 
 * @param {string} fileName 
 * @returns {any}
 */
function writableConfig(guildId, fileName){
    //guild specific file Id
    let id = path.join(__dirname, guildId, fileName);

    //check if a proxy for this Id already exists in cache
    //if so, return the proxy in cache
    let cacheEntries = _proxies_cache.filter(c => c.id === id);
    if(cacheEntries.length > 0){
        //record access time and extend lifetime of proxy by 5mins
        cacheEntries[0].time = new Date(new Date().getTime() + ( 5 * 60000 ));
        return cacheEntries[0].data.proxy;
    }

    //fallback file Id
    let fallbackId = path.join(__dirname, "default", fileName);

    let val = null;

    try {
        //check if preferred disk data exists
        if(fs.existsSync(id))
        {
            val = JSON.parse(fs.readFileSync(id));
        }
        else
            //throw that preferred disk data does not exist
            throw `"${id}" not found.`
    } catch (error) {
        //check if required directory structure exists and create if not
        if(!fs.existsSync(path.dirname(id)))
            fs.mkdirSync(path.dirname(id), { recursive: true });

        //check if required disk data file exists and copy from default if not
        if(!fs.existsSync(id))
            fs.writeFileSync(id, fs.readFileSync(fallbackId, { encoding:"utf8" }));
        
        //read from newly commited file
        val = JSON.parse(fs.readFileSync(id, { encoding:"utf8" }));
    }

    //construct new proxy for the file
    let jp = new JsonProxy({ jsonFilePath: id, defaultData:val });
    //add proxy to cache with a validity period of 5mins
    _proxies_cache.push({ data:jp, time: new Date(new Date().getTime() + ( 5 * 60000 )), id });
    return jp.proxy;
}

/**
 * Gets the config for a given guild
 * @param {string} guildId 
 */
module.exports.appConfig = function(guildId){
    return getConfig(guildId, "app.json");
}

module.exports.getConfig =  getConfig;
module.exports.writableConfig =  writableConfig;
module.exports.default = getConfig;