const IndustryConfig = require('../models/IndustryConfig');

/**
 * @desc    Get industry page configuration
 * @route   GET /api/industry/config
 * @access  Public
 */
const getIndustryConfig = async (req, res, next) => {
  try {
    let config = await IndustryConfig.findOne();
    
    // If no config exists, create default with sample data
    if (!config) {
      config = await IndustryConfig.create({
        projects: [
          {
            title: "Electric Vehicle Battery Enclosure Design",
            tools: "SOLIDWORKS & ANSYS",
            description: "Structural design and crash simulation with thermal management analysis",
            order: 1
          },
          {
            title: "Aircraft Wing Structural Analysis",
            tools: "CATIA & FEA",
            description: "Complex surface modeling and structural integrity validation under flight loads",
            order: 2
          }
        ],
        benefits: [
          {
            title: "Immediate Job Readiness",
            description: "Companies don't have time for extensive training. They need engineers who can contribute from day one.",
            order: 1
          },
          {
            title: "Higher Starting Salaries",
            description: "Engineers with specialized CAD, CAE, and design skills command premium salaries.",
            order: 2
          }
        ],
        companyCategories: [
          {
            title: "Automotive manufacturers",
            description: "Including electric vehicle innovators and traditional OEMs",
            order: 1
          },
          {
            title: "Aerospace companies",
            description: "Developing next-generation aircraft and space systems",
            order: 2
          }
        ]
      });
    }

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get industry config error:', error);
    next(error);
  }
};

/**
 * @desc    Update industry page configuration
 * @route   PUT /api/industry/config
 * @access  Private (Admin only)
 */
const updateIndustryConfig = async (req, res, next) => {
  try {
    const updateData = req.body;

    let config = await IndustryConfig.findOne();
    
    if (!config) {
      config = await IndustryConfig.create(updateData);
    } else {
      config = await IndustryConfig.findOneAndUpdate(
        {},
        updateData,
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Industry configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Update industry config error:', error);
    next(error);
  }
};

module.exports = {
  getIndustryConfig,
  updateIndustryConfig
};

