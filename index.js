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
   * successfully complete, 
   * @param {object=} options.data Optional paramater that can be passed through
   * the queue.
   */
  queue(name, options={}){
    const {interval, data, fail, success} = options;
    const queue = new Queue(name, {data, fail, success});
    this.queues.add(queue);

    // if an interval was defined, create a new interval object and start the
    // timer.
    if (interval){
      const intrvl = setInterval( () => {
        const runData = _.isEmpty(data) ? {} : data;
        queue.run(runData);
      }, interval)

      // add to the intervals Map
      this.intervals.set(name, intrvl);
    }
  }

  /**
   * Add a new name/function pair to a function. If the queue doesn't exist yet
   * create a new instance of the queue and add the entry.
   * @param {string} queue The name of the queue object to add the options to.
   * @param {string} name A name to associate the queue action with.
   * @param {function} func The action to take when the queue is called.
   */
  add(queue, name, func){
    if(!this.get(queue)){
      this.queue(queue);
    }
    this.get(queue).queue.set(name, func);
  }

  /**
   * Return a named queue object.
   * @param {string} queue The name of thet queue object to return 
   */
  get(queue) {
    queue = queue.toLowerCase();
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
    this.name = name.toLowerCase(),
    this.fail = options.fail || null,
    this.interval = options.interval || null,
    this.data = options.data || {},
    this.queue = new Map()
  }

  add(name, func) {
    this.queue.set(name,func);
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
    }
  }
}

// create a singleton instance of the queue manager.
module.exports = new QueueManager();