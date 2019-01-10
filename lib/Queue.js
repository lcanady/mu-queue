const _ = require('lodash');

/** Create a new Queue object */
class Queue {

  /**
   * new Queue()
   * @param {object} options Optional parameters fed to the Queue class when
   * instanatiating a new queue object.
   * @param {number=} options.interval The interval in milliseconds that 
   * the queue should run.
   */
  constructor(options={}) {
    this.interval = options.interval || null;
    this.jobs = new Map();
  }

  /**
   * Add a job to the queue. 
   * @param {*} name The name of the job to be added.
   * @param {function} job A function to be evoked when the queue runs the
   * job. The function accepts two parameters, data and next. 
   * 
   * @return {Queue} Returns the current instance of the queue object.
   */
  addJob(name, job) {
    this.jobs.set(name, job);
    return this;
  }

  /**
   * Check to see if a queue exists. 
   * @param {string} name Requested queue name 
   * 
   * @return {boolean}
   */
  hasJob(name) {
    return this.jobs.has(name);
  }

  /**
   * Grab a reference to the job function object.
   * @param {string} name name of the job within a queue.
   * 
   * @return {function}
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
  start(data,callback) {
    if(this.interval && _.isNumber(this.interval)) {
      const interval = setInterval(() => this.run(data, callback), this.interval);
      this.timeout = interval;
    }
    return this;
  }

  /** 
   * End a previously running queue with an automatic itenterval
   * @return {Queue} 
   * */
  stop() {
    clearInterval(this.timeout);
    return this;
  }

  run(data, callback) {
    let workingData = new QueueData(data);

    let jobs = this.jobs.keys();
    let currJob;
    
    /**
     * Invoking next() advances the jobs iterator and fires the next job in
     * in the Queue. It also handles data tracking from job to job.
     * @param {error=} err Optional error object.
     * @param {*} data Data to be passed to the queue
     * 
     * @return {runCallback} 
     */
    const next = (err, data) => {
      
      // Log data if there is any
      if (data) {
        workingData.jobs.push({
          data: workingData.output,
          name: currJob.value
        });
      }
      
      //advance currJob
      currJob = jobs.next();

      // error checking, and if no more entries in the iterator fire the
      // callback method.
      if (err) {
        return setImmediate(() => callback(err));
      } 
      if (currJob.done || workingData.finished) {
        return setImmediate(() => callback(null, workingData));
      }
        
      try {
        // Try running currJob.
        setImmediate(() => {
          this.jobs.get(currJob.value)(workingData, next);
        });
      } catch (error) {
        next(error);
      }

    }
    next();
  }
}

/** Class for managing data generated in the queue. */
class QueueData {

  /**
   *  new QueueData()
   * @param {*=} [input=null] The initial value of QueueData
   * @param {array} jobs Placeholder for job specific results.
   * @param {*=} [val=null] The current value of QueueData1 
   */
  constructor(input){
    this.input = input || null;
    this.jobs = [];
    this.output = input || null;
    this.msg = null;
    this.finished = false;
  }

  /**
   * Get/Set the object output.
   * @param {*=} input 
   */
  val(input=null) {
    if (input) {
      this.output = input;
      return this.output;
    } else {
      return this.output;
    }
  
  }

  done(input=null) {
    if (input) this.msg = input;
      this.finished = true;
  }

}

/**
 * @typedef {function} runCallback Callback definition for Queue.run
 * @property {error=} err Optional error object.
 * @property {*=} data Data passed from the jobs run by the Queue. 
 */

module.exports = Queue;