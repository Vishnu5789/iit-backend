const Blog = require('../models/Blog');
const BlogSubscriber = require('../models/BlogSubscriber');
const { sendEmail } = require('../config/email');

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
 * Helper function to send blog notification email to subscribers
 */
const sendBlogNotificationEmail = async (blog, subscribers) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const blogUrl = `${frontendUrl}/blog/${blog._id}`;

  const emailPromises = subscribers.map(async (subscriber) => {
    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Blog Post: ${blog.title}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0b5563 0%, #0d6e7f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">New Blog Post!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              We're excited to share our latest blog post with you!
            </p>
            
            <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0b5563;">
              <h2 style="color: #0b5563; margin-top: 0; font-size: 24px;">${blog.title}</h2>
              <p style="color: #666; margin: 10px 0;"><strong>Category:</strong> ${blog.category}</p>
              <p style="color: #666; margin: 10px 0;"><strong>Read Time:</strong> ${blog.readTime}</p>
              <p style="color: #666; margin: 15px 0 0 0;">${blog.summary}</p>
            </div>
            
            <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <a href="${blogUrl}" 
                 style="display: inline-block; background: #0b5563; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0;">
                Read Full Article
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
              You're receiving this email because you subscribed to our engineering newsletter.<br>
              <a href="${frontendUrl}/blog/unsubscribe?email=${encodeURIComponent(subscriber.email)}&token=${subscriber.unsubscribeToken}" style="color: #0b5563;">Unsubscribe</a>
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              Best regards,<br>
              <strong>Isaac Institute of Technology</strong>
            </p>
          </div>
        </body>
        </html>
      `;

      await sendEmail({
        to: subscriber.email,
        subject: `New Blog Post: ${blog.title}`,
        html: emailHtml
      });

      console.log(`Blog notification email sent to ${subscriber.email}`);
    } catch (emailError) {
      console.error(`Error sending email to ${subscriber.email}:`, emailError);
      // Continue with other emails even if one fails
    }
  });

  await Promise.all(emailPromises);
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

    // Send email notifications to all active subscribers
    if (blog.isPublished) {
      try {
        const subscribers = await BlogSubscriber.find({ isActive: true });
        if (subscribers.length > 0) {
          // Send emails asynchronously (don't wait for completion)
          sendBlogNotificationEmail(blog, subscribers).catch(error => {
            console.error('Error sending blog notification emails:', error);
          });
        }
      } catch (emailError) {
        console.error('Error fetching subscribers or sending emails:', emailError);
        // Don't fail blog creation if email fails
      }
    }

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
    const existingBlog = await Blog.findById(req.params.id);
    
    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const wasPublished = existingBlog.isPublished;
    const isNowPublished = req.body.isPublished !== undefined ? req.body.isPublished : existingBlog.isPublished;

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    // Send email notifications if blog was just published
    if (!wasPublished && isNowPublished && blog.isPublished) {
      try {
        const subscribers = await BlogSubscriber.find({ isActive: true });
        if (subscribers.length > 0) {
          // Send emails asynchronously (don't wait for completion)
          sendBlogNotificationEmail(blog, subscribers).catch(error => {
            console.error('Error sending blog notification emails:', error);
          });
        }
      } catch (emailError) {
        console.error('Error fetching subscribers or sending emails:', emailError);
        // Don't fail blog update if email fails
      }
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

