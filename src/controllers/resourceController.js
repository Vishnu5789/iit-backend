const Resource = require('../models/Resource');
const User = require('../models/User');

/**
 * @desc    Get all resources (public and authenticated)
 * @route   GET /api/resources
 * @access  Public
 */
exports.getResources = async (req, res, next) => {
  try {
    const { section, category, type, search, featured } = req.query;
    
    const query = { isActive: true };
    
    if (section) query.section = section;
    if (category) query.category = category;
    if (type) query.type = type;
    if (featured) query.featured = featured === 'true';
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const resources = await Resource.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .select('-accessibleTo');
    
    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Get resources error:', error);
    next(error);
  }
};

/**
 * @desc    Get single resource
 * @route   GET /api/resources/:id
 * @access  Public
 */
exports.getResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    // Increment view count
    resource.viewCount += 1;
    await resource.save();
    
    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Get resource error:', error);
    next(error);
  }
};

/**
 * @desc    Check if user has access to resource
 * @route   GET /api/resources/:id/access
 * @access  Private
 */
exports.checkAccess = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    // Free resources are accessible to everyone
    if (resource.type === 'free') {
      return res.status(200).json({
        success: true,
        hasAccess: true
      });
    }
    
    // Check if user has purchased/enrolled or has explicit access
    const user = await User.findById(req.user.id);
    const hasAccess = resource.accessibleTo.includes(user._id) || user.role === 'admin';
    
    res.status(200).json({
      success: true,
      hasAccess
    });
  } catch (error) {
    console.error('Check access error:', error);
    next(error);
  }
};

/**
 * @desc    Download/Access resource
 * @route   POST /api/resources/:id/download
 * @access  Private
 */
exports.downloadResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    // Check access for paid resources
    if (resource.type === 'paid') {
      const user = await User.findById(req.user.id);
      const hasAccess = resource.accessibleTo.includes(user._id) || user.role === 'admin';
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this resource. Please purchase to access.'
        });
      }
    }
    
    // Increment download count
    resource.downloadCount += 1;
    await resource.save();
    
    res.status(200).json({
      success: true,
      data: {
        url: resource.file.url,
        name: resource.file.name
      }
    });
  } catch (error) {
    console.error('Download resource error:', error);
    next(error);
  }
};

/**
 * @desc    Create resource (Admin)
 * @route   POST /api/resources
 * @access  Private (Admin)
 */
exports.createResource = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    
    const resource = await Resource.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: resource
    });
  } catch (error) {
    console.error('Create resource error:', error);
    next(error);
  }
};

/**
 * @desc    Update resource (Admin)
 * @route   PUT /api/resources/:id
 * @access  Private (Admin)
 */
exports.updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      data: resource
    });
  } catch (error) {
    console.error('Update resource error:', error);
    next(error);
  }
};

/**
 * @desc    Delete resource (Admin)
 * @route   DELETE /api/resources/:id
 * @access  Private (Admin)
 */
exports.deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    next(error);
  }
};

/**
 * @desc    Get resource statistics (Admin)
 * @route   GET /api/resources/stats
 * @access  Private (Admin)
 */
exports.getResourceStats = async (req, res, next) => {
  try {
    const totalResources = await Resource.countDocuments({ isActive: true });
    const freeResources = await Resource.countDocuments({ isActive: true, type: 'free' });
    const paidResources = await Resource.countDocuments({ isActive: true, type: 'paid' });
    
    const totalDownloads = await Resource.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$downloadCount' } } }
    ]);
    
    const totalViews = await Resource.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$viewCount' } } }
    ]);
    
    const byCategory = await Resource.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalResources,
        freeResources,
        paidResources,
        totalDownloads: totalDownloads[0]?.total || 0,
        totalViews: totalViews[0]?.total || 0,
        byCategory
      }
    });
  } catch (error) {
    console.error('Get resource stats error:', error);
    next(error);
  }
};

module.exports = exports;
