const HeroSlide = require('../models/HeroSlide');

// Get all hero slides (public)
exports.getHeroSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select('-createdBy -__v');
    
    res.json({
      success: true,
      count: slides.length,
      data: slides
    });
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero slides',
      error: error.message
    });
  }
};

// Get all hero slides including inactive (Admin only)
exports.getAllHeroSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find()
      .sort({ order: 1, createdAt: -1 })
      .populate('createdBy', 'name email');
    
    res.json({
      success: true,
      count: slides.length,
      data: slides
    });
  } catch (error) {
    console.error('Error fetching all hero slides:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero slides',
      error: error.message
    });
  }
};

// Get single hero slide
exports.getHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    
    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Hero slide not found'
      });
    }
    
    res.json({
      success: true,
      data: slide
    });
  } catch (error) {
    console.error('Error fetching hero slide:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero slide',
      error: error.message
    });
  }
};

// Create hero slide (Admin only)
exports.createHeroSlide = async (req, res) => {
  try {
    const slideData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const slide = await HeroSlide.create(slideData);
    
    res.status(201).json({
      success: true,
      message: 'Hero slide created successfully',
      data: slide
    });
  } catch (error) {
    console.error('Error creating hero slide:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create hero slide',
      error: error.message
    });
  }
};

// Update hero slide (Admin only)
exports.updateHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Hero slide not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Hero slide updated successfully',
      data: slide
    });
  } catch (error) {
    console.error('Error updating hero slide:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update hero slide',
      error: error.message
    });
  }
};

// Delete hero slide (Admin only)
exports.deleteHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    
    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Hero slide not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Hero slide deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete hero slide',
      error: error.message
    });
  }
};

// Reorder slides (Admin only)
exports.reorderSlides = async (req, res) => {
  try {
    const { slides } = req.body; // Array of { id, order }
    
    if (!Array.isArray(slides)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request format. Expected array of slides.'
      });
    }
    
    // Update order for each slide
    const updatePromises = slides.map(({ id, order }) =>
      HeroSlide.findByIdAndUpdate(id, { order }, { new: true })
    );
    
    await Promise.all(updatePromises);
    
    res.json({
      success: true,
      message: 'Slides reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering slides:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder slides',
      error: error.message
    });
  }
};

