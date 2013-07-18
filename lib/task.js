var util = require('util'),
    EventEmitter = require('events').EventEmitter;

function Task(options) {
    this.timeout = options.timeout;
    this.args = options.args;
    this.fn = options.fn;
    this.running = false;
    this.done = false;
    this.started = false;
    this.timedOut = false;
    EventEmitter.call(this);
}

util.inherits(Task, EventEmitter);

Task.prototype.run = function() {
    var callback, self = this;
    if (typeof this.args[this.args.length - 1] == 'function') {
        callback = this.args.pop();
    }
    this.args.push(function() {
        self.done = true;
        self.running = false;
        if (callback) {
            callback.apply(null, [].slice.call(arguments));
        }
        self.emit('end');
        if (!self.timedOut) {
            clearTimeout(self.timer);
            if (self.pool) {
                self.pool.next();
            }
        }
    });
    this.started = this.running = true;
    this.result = this.fn.apply(null, this.args);
    this.emit('run', this.result);
    this.timer = setTimeout(function() {
        self.timedOut = true;
        self.emit('timeout');
        if (self.pool) {
            self.pool.emit('timeout', self);
            self.pool.next();
        }
    }, this.timeout);
};

exports.Task = Task;
