const EventEmitter = require('events').EventEmitter;

class Task extends EventEmitter {
  constructor(options) {
    super();
    this.timeout = options.timeout;
    this.args = options.args;
    this.fn = options.fn;
    this.style = options.style || 'callback';
    this.promise = new Promise(resolve => this.on('run', resolve));
    this.then = this.promise.then.bind(this.promise);
    this.catch = this.promise.catch.bind(this.promise);
    this.running = false;
    this.done = false;
    this.started = false;
    this.timedOut = false;
  }

  run() {
    let callback;
    if (this.style !== 'promise' && typeof this.args[this.args.length - 1] === 'function') {
      callback = this.args.pop();
    }
    const resolve = function resolve() {
      this.done = true;
      this.running = false;
      if (callback) {
        callback.apply(null, [].slice.call(arguments));
      }
      this.emit('end');
      if (!this.timedOut) {
        clearTimeout(this.timer);
        if (this.pool) {
          this.pool.next();
        }
      }
    }.bind(this);
    if (this.style !== 'promise') {
      this.args.push(resolve);
    }
    this.started = this.running = true;
    this.result = this.fn.apply(null, this.args);
    if (this.style === 'promise') {
      this.result.then(resolve, resolve);
    }
    this.emit('run', this.result);
    this.timer = setTimeout(() => {
      this.timedOut = true;
      this.emit('timeout');
      if (this.pool) {
        this.pool.emit('timeout', this);
        this.pool.next();
      }
    }, this.timeout);
  }
}

exports.Task = Task;
