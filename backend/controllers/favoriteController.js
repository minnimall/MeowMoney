const Favorite = require('../models/Favorite');

const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).sort({ createdAt: 1 });
    res.json({ success: true, data: favorites });
  } catch (error) { next(error); }
};

const createFavorite = async (req, res, next) => {
  try {
    const { label, type, category, amount, note } = req.body;
    const favorite = await Favorite.create({ user: req.user._id, label, type, category, amount, note });
    res.status(201).json({ success: true, data: favorite });
  } catch (error) { next(error); }
};

const deleteFavorite = async (req, res, next) => {
  try {
    const favorite = await Favorite.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!favorite) {
      res.status(404);
      throw new Error('ไม่พบรายการโปรดนี้');
    }
    res.json({ success: true, data: {} });
  } catch (error) { next(error); }
};

module.exports = { getFavorites, createFavorite, deleteFavorite };