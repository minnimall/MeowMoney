const UserSettings = require('../models/UserSettings');

const getSettings = async (req, res, next) => {
  try {
    let settings = await UserSettings.findOne({ user: req.user._id });
    if (!settings) {
      settings = await UserSettings.create({ user: req.user._id });
    }
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
};

const updateSettings = async (req, res, next) => {
  try {
    const { budgets } = req.body;
    const settings = await UserSettings.findOneAndUpdate(
      { user: req.user._id },
      { $set: { ...(budgets !== undefined && { budgets }) } },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
};

module.exports = { getSettings, updateSettings };