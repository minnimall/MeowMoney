const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getMonthlySummary,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

// ทุก route ในไฟล์นี้ต้อง login ก่อนถึงใช้ได้
router.use(protect);

router.get('/summary', getSummary);
router.get('/monthly-summary', getMonthlySummary);

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.route('/:id')
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;