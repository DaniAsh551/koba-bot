const fs = require("fs/promises");
const fsS = require("fs");
const path = require("path");

/**
 * @description
 */
class JsonProxy {
  /**
   * @type {string}
   */
  jsonFilePath;
  /**
   * @type {Array<(any)=>void}
   */
  changeListeners = [];

  /**
   * @type any
   */
  internalJson = {};

  /**
   * @type {Proxy}
   */
  proxy;

  /**
   * @type {Array<(any) => void>}
   */
  changes = [];

  busy = false;

  /**
   * @type {fsS.FSWatcher}
   */
  watcher;

  constructor(jsonFilePath) {
    this.jsonFilePath = path.join(process.cwd(), jsonFilePath);

    //create file if not exists
    fs.access(this.jsonFilePath)
      .catch((err) => {
        fs.writeFile(this.jsonFilePath, "{}");
      })
      .then(() => {
        //proceed normal operations because file exists
        this.watcher = fsS.watch(this.jsonFilePath, (eventType, fileName) => {
          switch (eventType) {
            case "change": {
              fs.readFile(fileName, { encoding: "utf-8" }).then((content) => {
                let update = () => {
                  if (!this.busy) {
                    this.busy = true;
                    this.internalJson = JSON.parse(content);
                    this._refreshProxy();
                    this.busy = false;
                  } else setTimeout(update, 10);
                };
              });
            }
          }
        });

        this._refreshProxy();

        setInterval(() => {
          if (!this.busy && this.changes.length > 0) {
            this._update();
          }
        }, 50);
      });
  }

  /**
   * Adds a listener to the queue.
   * @param {(any) => void} listener
   * @returns {number} Unique id for the listener.
   */
  addListener(listener) {
    this.changeListeners.push(listener);
    return this.changeListeners.length - 1;
  }

  /**
   * Removes a listener from the queue.
   * @param {number} id Unique id for the listener.
   */
  removeListener(id) {
    if (
      !id ||
      typeof id !== "number" ||
      isNan(id) ||
      id >= this.changeListeners.length
    ) {
      throw Error("Invalid id");
    }

    this.changeListeners[id] = null;
  }

  _refreshProxy() {
    this.proxy = new Proxy(this.internalJson, {
      set: (obj, prop, value) => {
        let change = (json) => {
          json[prop] = value;
        };
        this.changes.push(change);
      },
      get: (obj, prop) => obj[prop],
    });
    this.changeListeners
      .filter((l) => l)
      .forEach((listener) => listener(this.proxy));
  }

  _update() {
    if (this.busy) return;

    this.busy = true;
    let changes = [...this.changes];
    this.changes = [];
    let json = { ...this.internalJson };
    changes.forEach((change) => change(json));

    let jsonString = JSON.stringify(json);
    fs.writeFile(this.jsonFilePath, jsonString);
    this.internalJson = json;
    this._refreshProxy();
    this.busy = false;
  }

  /**
   * Destroys this instance of JsonProxy.
   */
  destroy() {
    this.watcher.close();
    this.busy = true;
  }
}

module.exports = JsonProxy;
