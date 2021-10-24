# ![koba-bot](/src/avatar.png)
## Koba Bois discord bot
This is a bot by which we aim to eliminate the need for all or most of the other bots in our discord server.


### Structure
```
.                    : Project Root
├── package.json     : Node package.json file
├── src              : Contains all the source code
│   ├── avatar.png   : Bot avatar
│   ├── config       : Contains all the configuration JSON files
│   │   ├── app.json : Contains application wide configuration - this will be passed to each handler as the `config` argument
│   │   ├── ...json  : All other json configuration files for use in handlers and other modules
│   ├── handlers     : Contains all the handlers - see the Handler section below for details
│   │   ├── help.js  : The handler which handles the help command
│   │   ├── index.js : The core handler mapper - this file automatically detects and loads all handlers
│   │   └── ...js    : Other handlers - add your own handler here
│   ├── helper.js    : Contains project wide helper functions
│   └── index.js     : Application entry point - you most likely will not have to change this
└── yarn.lock        : Yarn lock file
```

### Contributing
Feel free to clone, make changes and submit a pull request, I would then inspect and allow it if the request passes the requirements below

#### Requirements for your pull request to be accepted
- All code must be in JS
- Each message must be handled individually in it's own handler file
- JSDoc standard comments must be present on any new handlers
- All new files must respect the directory structure of the project
- All the rules below must be followed

##### Handlers
Handlers are the basics of the bot. Each command is passed into its respective handler.
* Handler names should follow the pattern: `[command].js`
* All handlers must be inside the `src/handlers` directory
* All handlers must export an object with two properties, they are:
  * `KEY`: This is a string which tells the application which command this handler would handle
  * A property of the same name as the string `KEY`, eg: if `KEY` is `"help"`, the handler must export `{ KEY, help }`, where help is the handler function
  * Each handler function must accept `{ args:string[], message:Message, config:any }` as the argument where:
    * `args`    : The arguments which were recieved where the first element is the handler/command name and every other element is other arguments received in order
    * `message` : The Discord Message object - see discord.js docs for details
    * `config`  : The application wide configuration
* All handler functions must be asynchronous
* If you want your handler to simply output a message to the channel where it was invoked on, simply return a string from your handler.
* If you do not want the handler to output any message or handle outputs yourself (for more control), return `null` from your handler.
