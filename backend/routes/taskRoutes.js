const express = require('express');
const {
  createTask,
  getTasks,
  getTaskById,
  deleteTask,
  rerunTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); 

router.route('/').post(createTask).get(getTasks);
router.route('/:id').get(getTaskById).delete(deleteTask);
router.post('/:id/rerun', rerunTask);

module.exports = router;
