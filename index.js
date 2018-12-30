const _ = require('lodash');

class QueueManager {
  constructor() {
    this.queues = new Set();
    this.intervals = new Map();
  }

  /**
   * Create a new queue and add it to the queue manager.
   * @param {string} name Name of the queue to add to the manager.
   * @param {object} options Additional settings for creating a new queue.
   * @param {number=} options.interval Optional interval for queue to run in
   * miliseconds.
   * @param {function=} options.fail If the commands in the queue fail to
   * produce a truthy result, run a function if it fails.
   * @param {function=} options.success If the commands in the queue
   * successfully complete.
   */
  queue(name, options={}){
    const {interval, fail, success} = options;
    const queue = new Queue(name, {interval, fail, success});
    this.queues.add(queue);

    return queue;
  }

  /**
   * Add a new name/function pair to a function. If the queue doesn't exist yet
   * create a new instance of the queue and add the entry.
   * @param {string} queue The name of the queue object to add the options to.
   * @param {string} name A name to associate the queue action with.
   * @param {function} job The action to take when the queue is called.
   */
  add(queue, name, job){
    if(!this.get(queue)){
      this.queue(queue);
    }
    this.get(queue).queue.set(name, job);
    return this;
  }

  /**
   * 
   * @param {string} name 
   * @param {*=} data Optional data passed to the queue when the interval
   * starts. 
   */
  start(name, data=null) {
    // Get information on the requested queue.
    const queue = this.get(name);
    const {interval} = queue;
    const runData = _.isEmpty(data) ? {} : data;
    // if an interval was defined, create a new interval object and 
    // start the timer.
    if (interval){
      const intrvl = setInterval(() => queue.run(runData), interval);

      // add to the intervals Map
      this.intervals.set(name, intrvl);
    }
  }

  /**
   * Stop the queue from running on a timed repeat.
   * @param {string} queue The name of the queue we want clear the interval
   * from.
   */
  stop(queue) {
    const interval = this.interval.get(queue);
    clearInterval(interval);
  }

  /**
   * Return a named queue object.
   * @param {string} queue The name of thet queue object to return 
   */
  get(queue) {
    for (const entry of this.queues.values()) {
      if(entry.name === queue) return entry;
    }
  }

  /**
   * Execute a queue.
   * @param {string} queue The name of the queue to execute. 
   * @param {object} data Data object to pass to the queue.
   */
  async exec(queue, data={}) {
    // we can capture the return from queue.run later if it's ever needed.
    await this.get(queue).run(data);
  }
}

class Queue {
  constructor(name, options={}) {
    this.name = name,
    this.fail = options.fail || null,
    this.success = options.success || null,
    this.interval = options.interval || null,
    this.queue = new Map()
  }

  add(name, job) {
    this.queue.set(name, job);
    return this;
  }

  async run(data={}) {
    // iterate through each value in the queue and run the functions
    // in declaration order.  If data is provided, it's used instead
    // of the stored data. 

    // If data is empty, use this.data, else use data.
    let runData = (_.isEmpty(data)) ? this.data : data;
    let results;
    for (const func  of this.queue.values()) {
      results = await func(runData) || false;  
      if (results) return results;
    }

    // No results found
    if (!results) {
      // if there's a callback and it's a function, fire it.
      if(this.fail && _.isFunction(this.fail)) this.fail(runData);
    // If results returns true.
    } else {
      if(this.success && _.isFunction(this.success)) this.success(runData)
    }
  }
}

// create a singleton instance of the queue manager.
module.exports = new QueueManager();
module.exports.Queue = Queue;