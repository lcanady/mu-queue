const Queue = require('./lib/Queue');
const Manager = require('mu-manager');
const manager = new Manager();

/**
 * @module queues
 */
/**
 * Retrieve a queue, or create a new one if it doesn't exist.
 * @param {string} name Name of the requested queue.
 * @param {options=} options Options to be set on the Queue object
 * at creation
 * 
 * @return {Queue}
 */
module.exports = (name, options={}) => {
  if(manager.has(name)) {
    return manager.get(name);
  } else {
    const queue = new Queue(options);
    manager.register(name, queue);
    return queue;
  }
}