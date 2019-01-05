# Mu-Queue
A simple queue management system.

## Overview
The Mu-Queue system runs off of creating queues that hold jobs. When a queue is executed it is non-blocking, waiting for the event loop before running.

## Creating A Queue
Creating a new queue is simple.  Simply call the Mu-Queue object, and give it a string. If the queue exists it returns the queue, if it doesn't it creates the queue then returns it. 

```JavaScript
const queue = require('mu-queue');
queue('myQueue');
```
## Creating a Job
Jobs are the backbone of the Mu-Queue system. A job is a function that accepts two parameters.  an object, `data` and a function, `next`. Next must be called at the end of the function to advance the queue and accepts two parameters: `err` and `data`.  If you want to end the queue immediately, pass `data.done()`.

```JavaScript
queue('myQueue').addJob('Job1', (data, next) => {
  data.val('This job is awesome!');
  next(null, data.done('Over too soon!'));
});
```

## Running The Queue
To run the queue, we simply use it's run() method and pass it some data and acallback. The callback accepts two parameters, `err` and `results`.

```JavaScript
queue('myQueue').run('Some random input!', (err, results) => {
  if (err) console.log(err);
  console.log(results)
});
```
 
### Interval
Queues can also be created that run on an interval. This is also an example of how Queue methods can be chained together.
```JavaScript
const queue = require('mu-queue');
queue('timeQueue', {interval: 4000})
  .addJob('Job1', (data next) => {
    console.log('It\'s been 4 seconds!');
    next(null, data.done());
  })
  .start({foo:'bar'}, (err, results) => {
    console.log('Queue Complete'.);
  });
```