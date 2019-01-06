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
   * Start a queue that has an `interval` property set in milliseconds.
   * @param {*} data Optional data param passed to the jobs in the queue
   * when they run.
   * 
   * @return {Queue}
   */
  start({data, callback}) {

    if(this.interval && _.isNumber(this.interval)) {
      const interval = setInterval(() => {
        this.run({data, callback}), this.interval
      });
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

  /**
   * Run a queue of jobs consecutivly. 
   * @param {*=} data Optional data that can be sent to the queue 
   * upon execution.
   * @param {runCallBack=} callback Optinal callback to becalledwhen the
   * run completes/ 
   */
  run({data, callback}) {

    let workingData = new QueueData(data);
    
    let jobs = this.jobs.keys();
    
    /**
     * Invoking next() advances the jobs iterator and fires the next job in
     * in the Queue.
     * @param {error=} err Optional error object.
     * 
     * @return {runCallback} 
     */
    const next = (err) => {
      //advance currJob
      let currJob = jobs.next();
      
      // error checking.  If a callback is entered, call it, else throw the
      // error.
      if (err) {
        if(typeof(callback) === 'function'){
          return setImmediate(() => callback(err));
        } else {
          throw err;
        }
      } 

      // If no more entries in the iterator fire the callback method, else
      // return `workingData`. 
      if (currJob.done || workingData.finished) {
        workingData.finished = true;
        if(typeof(callback) === 'function'){
          return setImmediate(() => callback(null, workingData));
        } else {
          return workingData;
        }
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
    this.msg = null;
    this.finished = false;
    this.value=input;
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