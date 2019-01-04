const _ = require('lodash');
const {EventEmitter} = require('events');

const Job = require('./Job');

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

  constructor(options={}) {
    super();
    this.firstRes = options.firstRes || false;
    this.fail = options.fail || null;
    this.success = options.success || null;
    this.interval = options.interval || null;
    this.jobs = new Map();
    this.results = {};
    this.piping = options.piping || false;
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
    const entry = new Job({name, action:job});
    this.jobs.set(name, entry);
    return this;
  }

  /**
   * Retrieve a job object.
   * @param {string} name Name of the job to reference
   * 
   * @return {Job}
   */
  job(name) {
    return this.jobs.get(name);
  }

  /**
   * Start a queue that has an `interval` property set in milliseconds.
   * @param {*} data Optional data param passed to the jobs in the queue
   * when they run.
   * 
   * @return {Queue}
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
   * @return {results} Returns a results object.
   */
   exec(name, data=null){
    let results = {};
    
    // If the job is found, run it.
    if (this.job(name)) {
      results = this.job(name).run(data);
      
      // check to make sure an object is returned, if not, format the
      // response into results object format.
      switch (true) {
        // Check to see if results is an object.  If results IS an
        // object check it for the `res` property. Format to a 
        // correct response object if needed. 
        case (results && !_.isObject(results)) || 
          (_.isObject(results) && !results.hasOwnProperty('status')) :
          results = {
            status: results,
            msg: 'None',
            data: results
          };
          break;
        // If there's no truthy result, create a failing results
        // object.
        case !results:
          results = {
            status: false, 
            msg: 'None.'
          };
          break;
      }

    // Else return a failing results object.
    } else {
      results = {status: false, msg: 'Job not found.'};
    }

    return results;
  }

  /**
   * Success Event
   * @event Job#success
   * @property {string} name 
   * @property {results} results  
   */

   /**
   * fail Event
   * @event Job#fail
   * @property {string} name 
   * @property {results} results  
   */

  /**
   * When all jobs are complete in the queue with at least one truthy result.
   * @event Queue#queueSuccess
   * @param {RunResults} results Results from the queue run. 
   */

  /**
   * When all jobs are complete, and none have a truthy result.
   * @event Queue#queueFail
   * @param {RunResults} results Results from the queue run. 
   */

  /**
   * Iterate through each queued job in the order it was added to the stack.
   * if `firstRes` is set to true, the queue will exit at the first 
   * truthy results, and fire the optional success method contained on the
   * queue object. If `firstRes` is selected and no result returns truthy
   * the optional 'fail' method on the queue object is fired.
   * @param {*} data Optional data that can be fed to the jobs in the queue.
   * 
   * @fires Queue#queueSuccess
   * @fires Queue#queueFail

   */
  run(data=null) {
    this.results = {
      jobs:[]
    }
    let results = {};
    let workingData = data;

    for (const job of this.jobs.keys()) {
      results =  this.exec(job, workingData);

      // check for piping. If piping feed the value of workingData into the
      // next exec call, else start with a fresh copy of data.
      if(!this.piping) {
        workingData = data;
      } else {
        workingData = results.data ? results.data : data;
      }

      this.results.jobs.push(results);
      this.results.data = workingData;

      if (this.firstRes && results.status){
        this.emit('queueSuccess', this.results);      
      }
    }

    // Walk through the results object and find if there is a truthy
    // result for any of the jobs run
    let res = false;
    for (const job in this.results) {
      if(this.results[job].res) {
        res = true;
        break;
      }
    }

    if (res) {
      this.emit('queueSuccess', this.results);
    } else {
      this.emit('queueFail', this.results);
    }
    return this.results
  }

}

/**
 * @typedef {object} results The results object
 * @property {boolean} status Was the job successful or not?
 * @property {string=} msg Optional extra information about the job run.
 * @property {*=} data Optional data.
 */

 /**
  * @typedef {object} RunResults
  * @property {object} job The name of the job matching the desired results
  * @property {results} job.results The job results object.
  * @property {*=} data Optional data.
  */

module.exports = Queue;