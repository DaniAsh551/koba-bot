const express = require('express');
const {json:bodyParserJson} = require('body-parser');

/**
 * Spawn a new api.
 * @param {number} port 
 * @param {(express.Application) => void} onStart 
 */
function api(port, onStart){
    const api = express();
    
    api.use(bodyParserJson());

    const server = api.listen(port, function(){
        if(onStart)
            onStart(server);
    });
}

module.exports = api;