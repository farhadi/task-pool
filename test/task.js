'use strict';

const assert = require('assert');
const Task = require('../lib/task.js').Task;

describe('Task', function() {
  it('should emit `run` event when the task is executed', function(done) {
    const task = new Task({
      fn: i => ++i,
      args: [10],
    });
    task.on('run', result => {
      assert.equal(result, 11);
      done();
    }).run();
  });

  it('should emit timeout when the task exceeds the timeout limit', function(done) {
    const task = new Task({
      timeout: 100,
      fn: i => ++i,
      args: [10],
    });
    task.on('timeout', done).run();
  });
});
