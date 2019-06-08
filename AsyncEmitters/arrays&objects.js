'use strict';

class AsyncEmitter {
  constructor() {
    this.eventsOn = {};
    this.eventsOnce = {};
  }

  on(name, fn) {
    let event = this.eventsOn[name];
    if (!event) {
      event = [];
      this.eventsOn[name] = event;
    }
    if (!event.includes(fn)) event.push(fn);
  }

  once(name, fn) {
    if (fn === undefined) {
      return new Promise(resolve => {
        this.once(name, resolve);
      });
    }
    let event = this.eventsOnce[name];
    if (!event) {
      event = [];
      this.eventsOnce[name] = event;
    }
    if (!event.includes(fn)) event.push(fn);
    return null;
  }

  async emit(name, ...args) {
    const on = this.eventsOn[name] || [];
    const once = this.eventsOnce[name] || [];
    const promises = [...on,...once];
    delete this.eventsOnce[name];
    if(on.length === 0) delete this.eventsOn[name];
    return Promise.all(promises.map(fn => fn(...args)));
  }

  remove(name, fn) {
    const { eventsOn, eventsOnce } = this;
    if (!eventsOn[name] && !eventsOnce[name]) return;
    const on = eventsOn[name] || [];
    const once = eventsOnce[name] || [];
    on.splice(on.indexOf(fn), 1);
    once.splice(once.indexOf(fn), 1);
    if (on.length === 0) delete this.eventsOn[name];
    if (once.length === 0) delete this.eventsOnce[name];
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
    const on = this.eventsOn[name] || [];
    const once = this.eventsOnce[name] || []; 
    return [...on, ...once];
  }

  names() {
    const events = Object.assign({}, this.eventsOn, this.eventsOnce);
    return Object.keys(events);
  }
}

// const ee = new AsyncEmitter();

// (async () => {

//   ee.once('e1', async () => {
//     console.log('e1 listener 1');
//   });

//   ee.once('e1', async () => {
//     console.log('e1 listener 2');
//   });
//   console.log(ee.count('e1'))
//   console.log(ee.names().length)
//   ee.emit('e1');
//   console.log(ee.count('e1'))
//   console.log(ee.names().length);

  
// })();

module.exports = { AsyncEmitter };
