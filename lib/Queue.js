const _ = require('lodash');
const {EventEmitter} = require('events');

/** 
 * Create a new Queue object.
 * @extends EventEmitter
 */
class Queue extends EventEmitter {

  /**
   * Constructor for new Queue objects
   * @param {object} options Optional parameters fed to the Queue class when
   * instanatiating a new queue object.
   * @param {number=} options.interval The interval in milliseconds that 
   * the queue should run.
   * @param {boolean=} options.firstRes If the queue should stop running
   * after the first successful thruthy response of a job or not.
   * @param {function=} options.fail Optional. If `firstRes` is set, then 
   * this function will fire if no jobs return truthy.
   * @param {function=} options.success Optional. If `firstRes` is set and
   * a job returns truthy, run this function. It's given the paramaters
   * `results` with the results object from the job and optionally `data`
   * if data is fed to the queue at run time.
   */

  constructor(options) {
    super();
    this.firstRes = options.firstRes || false;
    this.fail = options.fail || null;
    this.success = options.success || null;
    this.interval = options.interval || null;
    this.jobs = new Map();
  }

  /**
   * Add a job to the queue. 
   * @param {*} name The name of the job to be added.
   * @param {function} job A function to be evoked when the queue runs the
   * job. The function can accept an optional `data` paramater, passed down
   * when the queue runs. 
   * 
   * @return {Queue} Returns the current instance of the queue object.
   */
  add(name, job) {
    this.jobs.set(name, job);
    return this;
  }

  /**
   * Start a queue that has an `interval` property set in milliseconds.
   * @param {*} data Optional data param passed to the jobs in the queue
   * when they run.
   */
  start(data=null) {
    if(this.interval && _.isNumber(this.interval)) {
      const interval = setInterval(() => this.run(data), this.interval);
      this.timeout = interval;
    }
    return this;
  }

  /** End a previously running queue with an automatic itenterval */
  stop() {
    clearInterval(this.timeout);
    return this;
  }

  /**
   * Execute a single named job.
   * @param {string} name The name of the job to run.
   * @param {*=} data Optional data passed to the job on execution.
   * 
   * @fires Queue#jobSuccess
   * @fires Queue#jobFail
   * 
   * @return {results} Returns a results object.
   */
  async exec(name, data=null){
    const job = this.jobs.get(name);
    let results = {};
    
    // If the job is found, run it.
    if (name) {
      results = await job(data);
      
      // check to make sure an object is returned, if not, format the
      // response into results object format.
      switch (true) {
        // Check to see if results is an object.  If results IS an
        // object check it for the `res` property. Format to a 
        // correct response object if needed. 
        case (results && !_.isObject(results)) || 
          (_.isObject(results) && !results.hasOwnProperty('res')) :
          results = {res: results};
          break;
        // If there's no truthy result, create a failing results
        // object.
        case !results:
          results = {res: false};
          break;
      }

    // Else return a failing results object.
    } else {
      results = {res: false, msg: 'Job not found.'};
    }

    // fire completed job events
    if(results.res) {
      this.emit('jobSuccess', name, results);
    } else {
      this.emit('jobFail', name, results);
    }

    return results;
  }

  /**
   * Success Event
   * @event Queue#jobSuccess
   * @property {string} name 
   * @property {results} results  
   */

   /**
   * fail Event
   * @event Queue#jobFail
   * @property {string} name 
   * @property {results} results  
   */

  /**
   * Iterate through each queued job in the order it was added to the stack.
   * if `firstRes` is set to true, the queue will exit at the first 
   * truthy results, and fire the optional success method contained on the
   * queue object. If `firstRes` is selected and no result returns truthy
   * the optional 'fail' method on the queue object is fired.
   * @param {*} data Optional data that can be fed to the jobs in the queue. 
   */
  async run(data=null) {
    let results = {};
    for (const job of this.jobs.keys()) {
      results = await this.exec(job, data);

      if (this.firstRes && results.res){
        results.data = data;
        if(_.isFunction(this.success)) this.success(results);      
      }
    }

    if (this.firstRes && !results.res) {
      results.data = data;
      if(_.isFunction(this.fail)) this.fail(results);
    }
  }
}

/**
 * @typedef {object} results
 * @property {boolean} res Was the job successful or not?
 * @property {string=} msg Optional extra information about the job run.
 * @property {*=} data     Optional data sent to the job. 
 */

module.exports = Queue;