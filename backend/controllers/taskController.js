const Task = require('../models/Task');
const taskQueue = require('../queue/taskQueue');

const createTask = async (req, res) => {
  try {
    const { title, inputText, operationType } = req.body;

    if (!title || !inputText || !operationType) {
      return res.status(400).json({ message: 'title, inputText and operationType are required' });
    }

    const allowedOps = ['UPPERCASE', 'LOWERCASE', 'REVERSE', 'WORD_COUNT'];
    if (!allowedOps.includes(operationType)) {
      return res.status(400).json({ message: `operationType must be one of: ${allowedOps.join(', ')}` });
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      inputText,
      operationType,
      status: 'PENDING',
      logs: [{ message: 'Task created and queued.' }]
    });
    taskQueue.enqueue(task._id.toString());

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};
const getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Task.countDocuments(filter)
    ]);

    return res.status(200).json({
      tasks,
      page,
      totalPages: Math.ceil(total / limit),
      totalTasks: total
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    return res.status(200).json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

const rerunTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = 'PENDING';
    task.result = null;
    task.startedAt = undefined;
    task.completedAt = undefined;
    task.logs.push({ message: 'Task re-queued for execution.' });
    await task.save();

    taskQueue.enqueue(task._id.toString());

    return res.status(200).json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Error re-running task', error: error.message });
  }
};

module.exports = { createTask, getTasks, getTaskById, deleteTask, rerunTask };
