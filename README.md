# Mu-Queue
A simple queue management system.

## Overview
The MuQueue system runs off of creating queues that hold jobs.  Jobs are executed either individually, or as a series.  Jobs are considered successful when they return a truthy result.  If you need to access multiple queues across your code, you can use the queueManager to register your queues, and access them elsewhere without having to require multiple files.

### Basic Example
```JavaScript
const queue = require('mu-queue');

// Create a new queue and add a job.
queue('testQueue').add('job1', (data) => {
  console.log(data);
  return {
    res: true,
    msg: 'Job complete.'
  }
})

// Hook into a few events.
queue('testQueue').on('queueComplete', (results) => {
  console.log(`Queue succeess. Results: ${results}`);
})

queue('testQueue').on('queuefail', (results) => {
  console.log(`Queue failure. Results: ${results}`);
})

// Run our queue with some data!
queue('testQueue').run(data);
```
### Interval
Queues can also be created that run on an interval.
```JavaScript
const queue = require('mu-queue');
queue('timeQueue', {interval: 4000}).add(data => {
  console.log('It\'s been 4 seconds!');
  return {
    res: true,
    msg: 'Job Triggered.'
  }

  // Start the timer.
  queue('timeQueue').start(data);
});
```