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
    const val = Object.values(event);
    if (!val.includes(fn)) event[val.length] = fn;
  }

  once(name, fn) {
    if (fn === undefined) {
      return new Promise(resolve => {
        this.once(name, resolve);
      });
    }
    let event = this.eventsOnce[name];
    if (!event) {
      event = {};
      this.eventsOnce[name] = event;
    }
    const val = Object.values(event);
    if (!val.includes(fn)) event[val.length] = fn;
    return undefined;
  }

  async emit(name, ...args) {
    const on = Object.values(this.eventsOn[name] || {});
    const once = Object.values(this.eventsOnce[name] || {});
    const promises = [...on,...once];
    delete this.eventsOnce[name];
    if(on.length === 0) delete this.eventsOn[name];
    return Promise.all(promises.map(fn => fn(...args)));
  }


  remove(name, fn) {
    const { eventsOn , eventsOnce } = this;
    if (!eventsOn[name] && !eventsOnce[name]) return;
    eventsOn[name] = eventsOn[name] || {};
    eventsOnce[name] = eventsOnce[name] || {};
    delete eventsOn[name][Object.values(eventsOn[name]).indexOf(fn)];
    delete eventsOnce[name][Object.values(eventsOnce[name]).indexOf(fn)];
    if (Object.values(eventsOn[name]).length === 0) delete this.eventsOn[name];
    if (Object.values(eventsOnce[name]).length === 0) delete this.eventsOnce[name];
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
    const onEvents = Object.values(this.eventsOn[name] || {});
    const onceEvents = Object.values(this.eventsOnce[name] || {}); 
    return [...onEvents, ...onceEvents];
  }

  names() {
    const events = Object.assign({}, this.eventsOn, this.eventsOnce);
    return Object.keys(events);
  }
}

const ee = new AsyncEmitter();

(async () => {

  ee.once('e1', async () => {
    console.log('e1 listener 1');
  });

  ee.once('e1', async () => {
    console.log('e1 listener 2');
  });
  console.log(ee.count('e1'))
  console.log(ee.names().length)
  ee.emit('e1');
  console.log(ee.count('e1'))
  console.log(ee.names().length);

  
})();

module.exports = { AsyncEmitter };

