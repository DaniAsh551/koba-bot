const fs = require("fs/promises");
const fsS = require("fs");
const path = require("path");
const chokidar = require("chokidar");

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
   * @type {chokidar.FSWatcher}
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
        let initContent = fsS.readFileSync(this.jsonFilePath, {
          encoding: "utf-8",
        });
        this.internalJson = JSON.parse(initContent);

        //proceed normal operations because file exists
        this.watcher = chokidar.watch(this.jsonFilePath);
        this.watcher.on("change", () => this._onContentChange(this));

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
      typeof id !== "number" ||
      isNaN(id) ||
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
    if (this.busy || this.changes.length < 1) return;

    this.busy = true;
    //this.watcher.
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

  _onContentChange(jsonProxy) {
    if (jsonProxy.busy) return;
    let content = fsS.readFileSync(jsonProxy.jsonFilePath, {
      encoding: "utf-8",
    });
    let update = () => {
      if (!jsonProxy.busy) {
        jsonProxy.busy = true;
        jsonProxy.internalJson = JSON.parse(content);
        jsonProxy._refreshProxy();
        jsonProxy.busy = false;
      } else setTimeout(() => update(), 10);
    };
    update();
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
