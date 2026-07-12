const Analysis = require('../models/Analysis');

// @desc   Get authenticated user's analysis history
// @route  GET /api/history
// @access Private
exports.getHistory = async (req, res) => {
  try {
    const history = await Analysis.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('symbol company recommendation confidence createdAt reportData');

    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: 'Server error fetching research history.'
    });
  }
};

// @desc   Delete a specific saved analysis by ID
// @route  DELETE /api/history/:id
// @access Private
exports.deleteHistoryItem = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Saved report not found or unauthorized.'
      });
    }

    await analysis.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Research report removed from history.'
    });
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: 'Server error deleting research report.'
    });
  }
};
