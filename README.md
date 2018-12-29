```
 _____     _____                 
|     |_ _|     |_ _ ___ _ _ ___ 
| | | | | |  |  | | | -_| | | -_|
|_|_|_|___|__  _|___|___|___|___|
             |__|
```
A simple managed queue system.

# Install
```npm install muqueue```

# The Queue Manager
The manager is pretty simple. You create individual queues, add jobs to them, and then execute them. When a job completes, an event is fired that can be hooked into. Some queues are created with the interval option set, These jobs will run on a timer.

### Queues
Queues are collections of jobs to be run when it is executed.  Data can be passed to the queue upon execution, which is in turn passed down to each job within the queue. 

### Jobs
Jobs are functions that can optionally be passed a data parameter when it is executed.  The queue manager evaluates if a job was successful or not, by evaluating if it returns a truthy response or not.

## Basic Usage
```JavaScript
const q = require('muqueue');

// Create the queue
q.queue('basicQueue')

// create a job to be run through.
const Job = (data) => {
  console.log(data);
  return true;
}

// Add the job to our queue
q.add('basicQueue', 'testJob', job);

// Run the queue with data.
q.exec('basicQueue', data);

```
## Interval
Creating a queue with an interval works a bit differently.  First we require muqueue as per usual, but we will add an option, then start up the queue.
```JavaScript
// Create the queue.  Iterval is set in miliseconds.
q.queue('intervalQueue', {interval:4000});

// -- create a job and add it to the queue as defined above
// Start the queue
q.start('intervalQueue');

// Stop a queue
q.stop('intervalQueue');
```
