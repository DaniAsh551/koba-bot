const fs = require("fs");
const path = require("path");

fs.readdirSync(__dirname)
  .filter((x) => x !== "index.js")
  .forEach(function (file) {
    let modExport = require(path.join(__dirname, file));
    if(modExport.KEY)
      module.exports[modExport.KEY] = modExport;
  });
