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
Jobs are the backbone of the Mu-Queue system. A job is a function that accepts two parameters.  an object, `data` and a function, `next`. Next must be called at the end of the function to advance the queue and accepts an optional parameter, `err`.  If you want to end the queue immediately, use `data.done()`.

```JavaScript
queue('myQueue').addJob('Job1', (data, next) => {
  data.value.old = data.value;
  data.value = 'This job is awesome!';
  data.done();
  next();
});
```

## Running The Queue
To run the queue, we simply use it's run() method. it accepts an options object that you can add a `data` property and pass the queue data upon running. It also accepts an optional method, callback. It accepts two parameters, `err` and `results`.

```JavaScript
queue('myQueue').run({
  data:'Some random input!', 
  callback: (err, results) => {
    if (err) console.log(err);
    console.log(results)
  });
```
 
### Interval
Queues can also be created that run on an interval. This is also an example of how Queue methods can be chained together.

```JavaScript
const queue = require('mu-queue');
queue('timeQueue', {interval: 4000})
  .addJob('Job1', (data, next) => {
    console.log('It\'s been 4 seconds!');
    next(null, data.done());
  })
  .start({
    data: {foo:'bar'}, 
    callback: (err, results) => {
      console.log('Queue Complete');
    }
  );
```