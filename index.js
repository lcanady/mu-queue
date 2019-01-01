const Queue = require('./lib/Queue');
const queueManager = require('./lib/QueueManager.js');

module.exports = (name, options={}) => {
  if(queueManager.queues.has(name)) {
    return queueManager.get(name);
  } else {
    const queue = new Queue(options);
    queueManager.register(name,queue);
    return queue;
  }
}