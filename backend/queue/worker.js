const Task = require('../models/Task');
const taskQueue = require('./taskQueue');
const CONCURRENCY = 3;
let activeWorkers = 0;

const operations = {
  UPPERCASE: (text) => text.toUpperCase(),
  LOWERCASE: (text) => text.toLowerCase(),
  REVERSE: (text) => text.split('').reverse().join(''),
  WORD_COUNT: (text) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }
};

const addLog = async (task, message) => {
  task.logs.push({ message, timestamp: new Date() });
  await task.save();
};

const processTask = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task) return;

  try {
    task.status = 'RUNNING';
    task.startedAt = new Date();
    await task.save();
    await addLog(task, `Worker picked up task. Operation: ${task.operationType}`);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const operationFn = operations[task.operationType];
    if (!operationFn) {
      throw new Error(`Unsupported operation type: ${task.operationType}`);
    }

    const result = operationFn(task.inputText);

    task.result = result;
    task.status = 'SUCCESS';
    task.completedAt = new Date();
    await addLog(task, 'Task completed successfully.');
    await task.save();
  } catch (error) {
    task.status = 'FAILED';
    task.completedAt = new Date();
    await addLog(task, `Task failed: ${error.message}`);
    await task.save();
  }
};
const runLoop = async () => {
  if (activeWorkers >= CONCURRENCY) return;
  const taskId = taskQueue.dequeue();
  if (!taskId) return;

  activeWorkers += 1;
  try {
    await processTask(taskId);
  } finally {
    activeWorkers -= 1;
    setImmediate(runLoop);
  }
};
taskQueue.on('job-added', () => {
  for (let i = 0; i < CONCURRENCY; i += 1) {
    runLoop();
  }
});
setInterval(() => {
  for (let i = 0; i < CONCURRENCY; i += 1) {
    runLoop();
  }
}, 1000);

console.log(`Task worker started with concurrency=${CONCURRENCY}`);
