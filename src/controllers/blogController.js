const Blog = require('../models/Blog');

/**
 * @desc    Get all blogs
 * @route   GET /api/blogs
 * @access  Public
 */
const getBlogs = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { isPublished: true };

    if (category) {
      query.category = category;
    }

    const blogs = await Blog.find(query)
      .sort({ publishedDate: -1 })
      .populate('author', 'fullName email');

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single blog
 * @route   GET /api/blogs/:id
 * @access  Public
 */
const getBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'fullName email');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create blog
 * @route   POST /api/blogs
 * @access  Private (Admin only)
 */
const createBlog = async (req, res, next) => {
  try {
    // Add user ID to req.body
    req.body.author = req.user.id;

    const blog = await Blog.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update blog
 * @route   PUT /api/blogs/:id
 * @access  Private (Admin only)
 */
const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete blog
 * @route   DELETE /api/blogs/:id
 * @access  Private (Admin only)
 */
const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog
};

