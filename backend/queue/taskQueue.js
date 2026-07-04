const EventEmitter = require('events');

class TaskQueue extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
  }

  enqueue(taskId) {
    this.queue.push(taskId);
    this.emit('job-added');
  }

  dequeue() {
    return this.queue.shift();
  }

  size() {
    return this.queue.length;
  }
}
const taskQueue = new TaskQueue();

module.exports = taskQueue;
