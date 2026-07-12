const Analysis = require('../models/Analysis');
const { buildPresentationData } = require('../utils/presentationBuilder');

// Retrieve all past stock analyses saved by the authenticated user, sorted by creation date
exports.getHistory = async (req, res) => {
  try {
    const history = await Analysis.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('symbol company recommendation confidence createdAt reportData');

    const formattedHistory = history.map(item => {
      const itemObj = item.toObject();
      if (itemObj.reportData) {
        if (!itemObj.reportData.symbol) itemObj.reportData.symbol = itemObj.symbol;
        if (!itemObj.reportData.company) itemObj.reportData.company = itemObj.company;
        itemObj.reportData.presentationData = buildPresentationData(itemObj.reportData);
      }
      return itemObj;
    });

    return res.status(200).json({
      success: true,
      data: formattedHistory
    });
  } catch (error) {
    // Return a 500 error if query execution fails
    return res.status(500).json({
      success: false,
      message: 'Server error fetching research history.'
    });
  }
};

// Delete a specific analysis report from the authenticated user's saved history
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
    // Return a 500 error if the deletion fails
    return res.status(500).json({
      success: false,
      message: 'Server error deleting research report.'
    });
  }
};
