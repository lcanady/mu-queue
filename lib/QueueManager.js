

/** A managed system for queues */
class QueueManager {
  
  /** Create a new instance of the QueueManager */
  constructor() {
    this.queues = new Map();
  }

  /**
   * Register a queue with the global registry.
   * @param {string} name A named representation of the queue to used
   * for tracking. 
   * @param {Queue} queue The queue object to add to the global registry.
   * 
   * @return {QueueManager} The QueueManager instance 
   */
  register(name, queue) {

    this.queues.set(name, queue);
    return this;
  }

  /**
   * Pull a queue by registered name.
   * @param {string} name The name of the queue to look for.
   * 
   * @return {Queue} The requested queue object.
   */
  get(name) {
    return this.queues.get(name);
  }
}

module.exports = new QueueManager();