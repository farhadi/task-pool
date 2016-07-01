'use strict';

const EventEmitter = require('events').EventEmitter;
const Task = require('./task.js').Task;

class Pool extends EventEmitter {
  constructor(options) {
    super();
    options = options || {};
    this.timeout = options.timeout || 10000;
    this.style = options.style || 'callback';
    this.limit = options.limit || 10;
    this.running = 0;
    this.queue = [];
  }

  next() {
    this.running--;
    if (!this.start() && !this.running) {
      this.emit('idle');
    }
  }

  start() {
    if (this.running >= this.limit) return true;
    const task = this.queue.shift();
    if (!task) return false;
    this.running++;
    process.nextTick(task.run.bind(task));
    return true;
  }

  add(task) {
    task.pool = this;
    this.queue.push(task);
    this.start();
  }

  wrap(fn, options) {
    options = options || {};
    const timeout = options.timeout || this.timeout;
    const style = options.style || this.style;
    return function wrapped() {
      const task = new Task({
        fn,
        timeout,
        style,
        args: [].slice.call(arguments),
      });
      this.add(task);
      return task;
    }.bind(this);
  }

  get promise() {
    this.wrap = (fn, options) => {
      delete this.wrap;
      return this.wrap(fn, Object.assign({ style: 'promise' }, options));
    };
    return this;
  }
}

exports.Task = Task;
exports.Pool = Pool;
