const _ = require('lodash');
const {EventEmitter} = require('events');

/** 
 * Create a Job object 
 * 
 * @extends EventEmitter 
 */
class Job extends EventEmitter {
  /**
   * new Job()
   * @param {object} options Container for job options.
   * @param {string} options.name Name of the job.
   * @param {function} options.action The action to take when the job is run. 
   */

  constructor({name, action}) {
    super();
    this.name = name;
    this.action = action;
  }

  /**
   * Run an individual job.
   * @param {*=} data 
   * 
   * @fires Job#success
   * @fires Job#fail
   * @fires job#error 
   */
  run(data=null) {
    // Make sure action is a function first...
    if(_.isFunction(this.action)) {
      
      try {
        const results = this.action(data);
        results.job = this.name;
        
        // Emit job status messages.
        if(results.status) {
          this.emit('success', results);
        } else {
          this.emit('fail', results);
        }
        return results;

      } catch (error) {
        this.emit('error', error);
        return {
          status: false,
          msg: error.message,
          data: error
        }
      }
    }
  }

  /**
   * @event Job#success
   * @param {results}
   */
  
   /**
   * @event Job#fail
   * @param {results}
   */

   /**
   * @event Job#error
   * @param {error}
   */
}

module.exports = Job;