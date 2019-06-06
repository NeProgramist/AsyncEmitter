'use strict';

class AsyncEmitter {
  constructor() {
    this.eventsOn = {};
    this.eventsOnce = {};
  }

  on(name, fn) {
    let event = this.eventsOn[name];
    if (!event) {
      event = {};
      this.eventsOn[name] = event;
    }
    event[fn] = fn;
  }

  once(name, fn) {
    if (fn === undefined) {
      return new Promise(resolve => {
        this.once(name, resolve);
      });
    }
    let event = this.eventsOnce[name];
      const wrapper = (...args) => {
        delete event[fn];
        return fn(...args);
      };
    if (!event) {
      event = {};
      this.eventsOnce[name] = event;
    }
    event[fn] = wrapper;
  }

  async emit(name, ...args) {
    return Promise.all(this.listeners(name).map(fn => fn(...args)));
  }

  remove(name, fn) {
    const { eventsOn, eventsOnce } = this;
    if (!eventsOn[name] && !eventsOnce[name]) return;
    delete eventsOn[fn];
    delete eventsOnce[fn];
    if (Object.keys(eventsOn[name]).length === 0) delete eventsOn[name];
    if (Object.keys(eventsOnce[name]).length === 0) delete eventsOnce[name];
  }

  clear(name) {
    if (!name) {
      this.eventsOn = {};
      this.eventsOnce = {};
      return;
    }
    delete this.eventsOn[name];
    delete this.eventsOnce[name];
  }

  count(name) {
    return this.listeners(name).length;
  }

  listeners(name) {
    return [...Object.values(this.eventsOn[name] || {}), ...Object.values(this.eventsOnce[name] || {})];
  }

  names() {
    return Object.keys(Object.assign(this.eventsOn, this.eventsOnce));
  }
}

const ee = new AsyncEmitter();

(async () => {

  ee.on('e1', async () => {
    console.log('e1 listener 1');
  });

  ee.once('e1', async () => {
    console.log('e1 listener 1');
  });

  ee.on('e1', async () => {
    console.log('e1 listener 2');
  });

  ee.on('e1', async () => {
    console.log('e1 listener 3');
  });

  await ee.emit('e1');
  console.log(ee.listeners('e1'));
})();

module.exports = AsyncEmitter;