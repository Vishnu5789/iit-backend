const AboutSection = require('../models/AboutSection');

/**
 * @desc    Get all about sections (public)
 * @route   GET /api/about-sections
 * @access  Public
 */
exports.getAboutSections = async (req, res) => {
  try {
    const sections = await AboutSection.find({ isActive: true })
      .sort({ order: 1 })
      .select('-updatedBy -__v');
    
    res.json({
      success: true,
      count: sections.length,
      data: sections
    });
  } catch (error) {
    console.error('Error fetching about sections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch about sections',
      error: error.message
    });
  }
};

/**
 * @desc    Get all about sections for admin (includes inactive)
 * @route   GET /api/admin/about-sections
 * @access  Private (Admin only)
 */
exports.getAboutSectionsAdmin = async (req, res) => {
  try {
    const sections = await AboutSection.find()
      .sort({ order: 1 })
      .populate('updatedBy', 'fullName email');
    
    res.json({
      success: true,
      count: sections.length,
      data: sections
    });
  } catch (error) {
    console.error('Error fetching about sections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch about sections',
      error: error.message
    });
  }
};

/**
 * @desc    Get single about section
 * @route   GET /api/about-sections/:id
 * @access  Public
 */
exports.getAboutSection = async (req, res) => {
  try {
    const section = await AboutSection.findById(req.params.id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'About section not found'
      });
    }
    
    res.json({
      success: true,
      data: section
    });
  } catch (error) {
    console.error('Error fetching about section:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch about section',
      error: error.message
    });
  }
};

/**
 * @desc    Create about section
 * @route   POST /api/admin/about-sections
 * @access  Private (Admin only)
 */
exports.createAboutSection = async (req, res) => {
  try {
    const sectionData = {
      ...req.body,
      updatedBy: req.user._id
    };
    
    const section = await AboutSection.create(sectionData);
    
    res.status(201).json({
      success: true,
      message: 'About section created successfully',
      data: section
    });
  } catch (error) {
    console.error('Error creating about section:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create about section',
      error: error.message
    });
  }
};

/**
 * @desc    Update about section
 * @route   PUT /api/admin/about-sections/:id
 * @access  Private (Admin only)
 */
exports.updateAboutSection = async (req, res) => {
  try {
    const section = await AboutSection.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user._id
      },
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'About section not found'
      });
    }
    
    res.json({
      success: true,
      message: 'About section updated successfully',
      data: section
    });
  } catch (error) {
    console.error('Error updating about section:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update about section',
      error: error.message
    });
  }
};

/**
 * @desc    Delete about section
 * @route   DELETE /api/admin/about-sections/:id
 * @access  Private (Admin only)
 */
exports.deleteAboutSection = async (req, res) => {
  try {
    const section = await AboutSection.findByIdAndDelete(req.params.id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'About section not found'
      });
    }
    
    res.json({
      success: true,
      message: 'About section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting about section:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete about section',
      error: error.message
    });
  }
};

/**
 * @desc    Reorder about sections
 * @route   POST /api/admin/about-sections/reorder
 * @access  Private (Admin only)
 */
exports.reorderAboutSections = async (req, res) => {
  try {
    const { sections } = req.body; // Array of { id, order }
    
    const updatePromises = sections.map(item =>
      AboutSection.findByIdAndUpdate(item.id, { order: item.order })
    );
    
    await Promise.all(updatePromises);
    
    res.json({
      success: true,
      message: 'About sections reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering about sections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder about sections',
      error: error.message
    });
  }
};

/**
 * @desc    Initialize default about sections
 * @route   POST /api/admin/about-sections/initialize
 * @access  Private (Admin only)
 */
exports.initializeAboutSections = async (req, res) => {
  try {
    // Check if sections already exist
    const existingCount = await AboutSection.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'About sections already initialized'
      });
    }

    const defaultSections = [
      {
        key: 'hero',
        title: 'Welcome',
        content: 'Welcome to the Future of Engineering Design.\n\nWelcome to Isaac Institute of Technology.',
        order: 1,
        sectionType: 'hero',
        isActive: true,
        updatedBy: req.user._id
      },
      {
        key: 'tagline',
        title: 'Tagline',
        content: 'Dream it. Design it. Build it.',
        order: 2,
        sectionType: 'text',
        isActive: true,
        updatedBy: req.user._id
      },
      {
        key: 'introduction',
        title: 'Introduction',
        content: 'It is with great pride and excitement that we welcome you to the Isaac Institute of Technology, a premier institution dedicated to the art and science of engineering design.\n\nIn an era defined by rapid technological advancement, the role of the engineer has never been more critical. Our mission is to cultivate the next generation of engineering leaders—individuals who are not only technically proficient but also creative, ethical, and driven to make a positive impact on the world.',
        order: 3,
        sectionType: 'text',
        isActive: true,
        updatedBy: req.user._id
      },
      {
        key: 'mission',
        title: 'Our Mission',
        content: 'To educate the next generation of integrators—leaders who seamlessly blend analytical engineering, human-centered design, and business acumen to solve the world\'s most pressing challenges and create a more innovative, sustainable, and equitable future.',
        order: 4,
        sectionType: 'text',
        isActive: true,
        updatedBy: req.user._id
      },
      {
        key: 'philosophy',
        title: 'Our Philosophy: The Integrator\'s Mindset',
        content: 'The greatest innovations of the 21st century will not come from a single discipline. They will be born at the intersection.\n\nWe reject the old divide between the "how" of engineering and the "why" of design. At IIT, these are two sides of the same coin.\n\nIt\'s not just about building it right (Engineering Rigor)\nIt\'s about building the right thing (Design Empathy)\n\nOur educational philosophy is built on this fusion. We believe in learning by doing, thinking by making, and validating through real-world impact. From day one, you are not just a student; you are a creator in training.',
        order: 5,
        sectionType: 'text',
        isActive: true,
        updatedBy: req.user._id
      }
    ];

    const sections = await AboutSection.insertMany(defaultSections);
    
    res.status(201).json({
      success: true,
      message: 'About sections initialized successfully',
      data: sections
    });
  } catch (error) {
    console.error('Error initializing about sections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize about sections',
      error: error.message
    });
  }
};

