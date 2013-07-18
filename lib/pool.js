var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    Task = require('./task.js').Task;

function Pool(options) {
    EventEmitter.call(this);
    options = options || {};
    this.timeout = options.timeout || 10000;
    this.limit = options.limit || 10;
    this.running = 0;
    this.queue = [];
}

util.inherits(Pool, EventEmitter);

Pool.prototype.next = function() {
    this.running--;
    if (!this.start() && !this.running) {
        this.emit('idle');
    }
};

Pool.prototype.start = function() {
    if (this.running >= this.limit) return true;
    var task = this.queue.shift();
    if (!task) return false;
    this.running++;
    process.nextTick(task.run.bind(task));
    return true;
};

Pool.prototype.add = function(task) {
    task.pool = this;
    this.queue.push(task);
    this.start();
};

Pool.prototype.wrap = function(fn, options) {
    var timeout = this.timeout || options.timeout;
    var self = this;
    return function() {
        var task = new Task({
            fn: fn.bind(this),
            timeout: timeout,
            args: [].slice.call(arguments)
        });
        self.add(task);
        return task;
    };
};

exports.Task = Task;
exports.Pool = Pool;
