const JsonProxy = require("../helpers/json-proxy");

class DataSet {
  /** @description DO NOT ACCESS OR CHANGE VALUES */
  jProxy = null;
  /** @description DO NOT ACCESS OR CHANGE VALUES */
  isBusy = false;

  constructor(jsonFilePath) {
    this.jProxy = new JsonProxy(jsonFilePath, []);
  }

  /**
   * Gets all the data in the file.
   * @returns {Array<{id:number}>}
   */
  getData() {
    return this.jProxy.proxy;
  }

  /**
   * Add a new record to the file.
   * @param {any} record
   * @returns {Promise<number>}
   */
  push(record) {
    return new Promise((res, rej) => {
      try {
        while (this.isBusy) {}
        this.isBusy = true;
        let newId = this.getData().length > 0 ? this.getData()[0].id + 1 : 0;
        this.getData().push({ ...record, id: newId });
        this.isBusy = false;
        res(newId);
      } catch (e) {
        rej(e);
      }
    });
  }

  /**
   * Removes an existing record from the file.
   * @param {number} id The record Id.
   * @returns {Promise<number>}
   */
  remove(id) {
    return new Promise((res, rej) => {
      try {
        while (this.isBusy) {}
        this.isBusy = true;
        let index = this.findIndex(id);
        this.getData().splice(index, 1);
        this.isBusy = false;
        res(id);
      } catch (error) {
        rej({ error, id });
      }
    });
  }

  /**
   * Updates a given record.
   * @param {{id:number, ...any}} record
   * @returns {Promise}
   */
  update(record) {
    let { id } = record;
    return new Promise((res, rej) => {
      try {
        while (this.isBusy) {}
        this.isBusy = true;
        let index = this.findIndex(id);
        this.getData()[index] = record;
        this.isBusy = false;
        res(id);
      } catch (error) {
        rej({ error, id });
      }
    });
  }

  /**
   * Find the first record which matches a given predicate.
   * @param {(any) => boolean} predicate
   */
  find(predicate) {
    return new Promise((res, rej) => {
      try {
        while (this.isBusy) {}
        this.isBusy = true;
        let index = this.getData().findIndex(predicate);
        let record = this.getData()[index];
        this.isBusy = false;
        res(record);
      } catch (error) {
        rej({ error });
      }
    });
  }

  /**
   * Find all records which match a given predicate.
   * @param {(any) => boolean} predicate
   */
  findAll(predicate) {
    return new Promise((res, rej) => {
      try {
        while (this.isBusy) {}
        this.isBusy = true;
        let index = this.getData().filter(predicate);
        let records = this.getData()[index];
        this.isBusy = false;
        res(records);
      } catch (error) {
        rej({ error });
      }
    });
  }

  /**
   * Fetch a record by id.
   * @param {number} id
   * @returns {{id:number,...any}} record
   */
  getRecord(id) {
    let index = this.findIndex(id);
    return index < 0 ? null : this.getData()[index];
  }

  /**
   * Fetch the index of an item by it's id.
   * @param {number} id
   * @returns {number} index
   */
  findIndex(id) {
    return this.getData().findIndex((r) => r.id == id);
  }
}

module.exports = DataSet;
