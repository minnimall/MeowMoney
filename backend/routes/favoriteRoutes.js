const express = require('express');
const router = express.Router();
const {
  getFavorites,
  createFavorite,
  deleteFavorite,
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

// ทุก route ในไฟล์นี้ต้อง login ก่อนถึงใช้ได้
router.use(protect);

router.route('/')
  .get(getFavorites)
  .post(createFavorite);

router.route('/:id')
  .delete(deleteFavorite);

module.exports = router;