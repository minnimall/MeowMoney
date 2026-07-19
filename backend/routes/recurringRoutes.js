const express = require('express');
const router = express.Router();
const {
  getRecurring,
  createRecurring,
  deleteRecurring,
  generateDueTransactions, // เพิ่ม
} = require('../controllers/recurringController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getRecurring)
  .post(createRecurring);

router.post('/generate-due', generateDueTransactions); // เพิ่ม

router.route('/:id')
  .delete(deleteRecurring);

module.exports = router;