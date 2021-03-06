task-pool
=========
A generic pool to limit number of running asynchronous tasks or promises.

[![Build Status](https://travis-ci.org/farhadi/task-pool.png)](https://travis-ci.org/farhadi/task-pool)
[![Coverage Status](https://coveralls.io/repos/github/farhadi/task-pool/badge.svg?branch=master)](https://coveralls.io/github/farhadi/task-pool?branch=master)

Installation
------------

    npm install task-pool

Usage
-----

Consider you are going to do lots of asynchrounous CPU/IO intensive tasks.
Lets say running a huge number of external tasks using exec calls, or reading a lot of files in a loop.
In this case you may want to limit the number of running tasks at a time to avoid high load and memory usages.

task-pool does the job for you. It makes a queue of tasks and manages to run only a limited number of them at a time.

``` javascript
var Pool = require('task-pool').Pool;

//Create a new pool with a maximum number of 20 tasks at a time.
//Tasks taking longer than 5 seconds continue their journey out of the pool to leave space for new tasks.
var pool = new Pool({limit: 20, timeout: 5000});

//Create a wrapper around exec
var exec = pool.wrap(require('child_process').exec);

//An array of commands to be executed using exec.
var tasks = [ ... ];
for (i = 0; i < tasks.length; i++) {
    exec(tasks[i], function(error, stdout, stderr) {
        //Do some process on the results
    });
}
```

As you can see exec wrapper acts like the original exec method. The only exception is that it doesn't return the ChildProcess object immediately. It returns a `Task` object.
For example if you want to grab the pid of the child process, do it like this:

```javascript
var task = exec(tasks[i], function(error, stdout, stderr) {
    //Do some process on the results
});
task.on('run', function(child) {
    console.log(child.pid);
});
```

You can also wrap a function that returns a promise:

``` javascript
//Create a wrapper around exec
var exec = pool.promise.wrap(require('child-process-promise').exec);

//An array of commands to be executed using exec.
var tasks = [ ... ];
for (i = 0; i < tasks.length; i++) {
    exec(tasks[i]).then(result) {
        //Do some process on the result
    }).catch(error, function(error) {
        //Do something when an error occurs
    });
}
```

License
-------
task-pool is released under the MIT license.
