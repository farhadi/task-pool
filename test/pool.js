const assert = require('assert');
const Pool = require('../lib/pool.js').Pool;

describe('Pool', function() {
  const callbackTask = (param, callback) => {
    setImmediate(() => callback(null, param * 2));
  };

  const promiseTask = param => Promise.resolve(param * 2);

  it('should work promise style', function() {
    const pool = new Pool({ limit: 5 });
    const task = pool.promise.wrap(promiseTask);
    const tasks = [];
    let running = 0;
    let maxRun = 0;
    for (let i = 0; i < 100; i++) {
      tasks.push(task(i).on('run', () => {
        running++;
        maxRun = Math.max(running, maxRun);
      }).then(r => {
        running--;
        assert.equal(r, i * 2);
      }));
    }
    return Promise.all(tasks).then(() => assert.equal(maxRun, 5));
  });

  it('should work callback style', function() {
    const pool = new Pool({ limit: 5 });
    const task = pool.wrap(callbackTask);
    const tasks = [];
    let running = 0;
    let maxRun = 0;
    for (let i = 0; i < 100; i++) {
      tasks.push(task(i, (e, r) => {
        running--;
        assert.equal(r, i * 2);
      }).on('run', () => {
        running++;
        maxRun = Math.max(running, maxRun);
      }));
    }
    return Promise.all(tasks).then(() => assert.equal(maxRun, 5));
  });
});
