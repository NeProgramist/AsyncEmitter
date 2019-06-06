'use strict';

class AsyncEmitter {
  constructor() {
    this.events = {};
    this.wrappers = {};
  }

  on(name, fn) {
    let event = this.events[name];
    if (!event) {
      event = new Set();
      this.events[name] = event;
    }
    event.add(fn);
  }

  once(name, fn) {
    if (fn === undefined) {
      return new Promise(resolve => {
        this.once(name, resolve);
      });
    }
    const wrapper = (...args) => {
      this.remove(name, fn);
      return fn(...args);
    };
    this.wrappers[fn] = wrapper;
    this.on(name, wrapper);
  }

  async emit(name, ...args) {
    const event = this.events[name];
    if (!event) return;
    return Promise.all([...event.values()].map(fn => fn(...args)));
  }

  remove(name, fn) {
    const { events, wrappers } = this;
    const event = events[name];
    if (!event) return;
    if (event.has(fn)) event.delete(fn);
    const wrapper = wrappers[fn];
    if (wrapper) {
      delete wrappers[fn];
      event.delete(wrapper);
    }
    if (this.count(name) === 0) delete events[name];
  }

  clear(name) {
    const { events, wrappers } = this;
    if (!name) {
      this.events = {};
      this.wrappers = {};
      return;
    }
    const event = events[name];
    if (!event) return;
    for (const [fn, wrapper] of Object.entries(wrappers)) {
      if (event.has(wrapper)) delete wrappers[fn];
    }
    delete events[name];
  }

  count(name) {
    const event = this.events[name];
    return event ? event.size : 0;
  }

  listeners(name) {
    const event = this.events[name];
    return [...event];
  }

  names() {
    return [...Object.keys(this.events)];
  }
}

module.exports = AsyncEmitter;