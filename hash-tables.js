'use strict';

class AsyncEmitter {
  constructor() {
    this.events = new Map();
    this.wrappers = new Map();
  }

  on(name, fn) {
    let event = this.events.get(name);
    if (!event) {
      event = new Set();
      this.events.set(name, event);
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
    this.wrappers.set(fn, wrapper);
    this.on(name, wrapper);
    return undefined;
  }

  async emit(name, ...args) {
    const event = this.events.get(name);
    if (!event) return;
    const listeners = [...event.values()];
    const promises = listeners.map(fn => fn(...args));
    return Promise.all(promises);
  }

  remove(name, fn) {
    const { events, wrappers } = this;
    const event = events.get(name);
    if (!event) return;
    if (event.has(fn)) event.delete(fn);
    const wrapper = wrappers.get(fn);
    if (wrapper) {
      wrappers.delete(fn);
      event.delete(wrapper);
    }
    if (event.size === 0) events.delete(name);
  }

  clear(name) {
    const { events, wrappers } = this;
    if (!name) {
      events.clear();
      wrappers.clear();
      return;
    }
    const event = events.get(name);
    if (!event) return;
    for (const [fn, wrapper] of wrappers.entries()) {
      if (event.has(wrapper)) wrappers.delete(fn);
    }
    events.delete(name);
  }

  count(name) {
    const event = this.events.get(name);
    return event ? event.size : 0;
  }

  listeners(name) {
    const event = this.events.get(name);
    return [...event];
  }

  names() {
    return [...this.events.keys()];
  }
}


module.exports = AsyncEmitter;