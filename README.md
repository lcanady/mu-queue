```
 _____     _____                 
|     |_ _|     |_ _ ___ _ _ ___ 
| | | | | |  |  | | | -_| | | -_|
|_|_|_|___|__  _|___|___|___|___|
             |__|
```
A simple queue management system.

## Install
```npm install muqueue```

## Overview
The MuQueue system runs off of creating queues that hold jobs.  Jobs are executed either individually, or as a series.  Jobs are considered successful when they return a truthy result.  If you need to access multiple queues across your code, you can use the queueManager to register your queues, and access them elsewhere without having to require multiple files.

### Basic Example
```JavaScript
const {Queue, queueManager} = require('muqueue');
let myQueue = new Queue();

// Add a job to the queue.
myQueue.add('myJob', (data) => {
  console.log(data);
  return = {
    res: true,
    msg: 'Job Complete.'
  }
});

// Register the queue with the queueManager.
queueManager.register('myQueue', myQueue);

// Run the queue later.
myQueue.run(data);

// To retrieve your queue object later once it's been stored in the global
// queueManager in a different module...
myQueue = queueManager.get('myQueue');
myQueue.run(data);
```

### Interval Queue Example
Creating a queue that fires on an interval is just a little different.
```JavaScript
const {Queue} = require('muqueue');
let myQueue = new Queue({interval:4000});

// Add a job to the queue.
myQueue.add('myJob', (data) => {
  console.log(data);
  return = {
    res: true,
    msg: 'Job Complete.'
  }
});

// Start the queue.
myQueue.start(data);

// Stop the queue.
myQueue.stop();
```

