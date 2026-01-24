const CoursePage = require('../models/CoursePage');

// Get active course page configuration
exports.getCoursePageConfig = async (req, res, next) => {
  try {
    let config = await CoursePage.findOne({ isActive: true });
    
    // Create default config if none exists
    if (!config) {
      config = await CoursePage.create({
        heroTitle: 'Master Industry-Standard CAD, CAE & Engineering Tools',
        heroDescription: 'In today\'s competitive engineering landscape, proficiency in design and simulation software is no longer optional—it\'s essential. Whether you\'re developing innovative products, analyzing complex systems, or bringing ideas to life, mastering industry-standard engineering tools gives you a decisive edge. Our comprehensive courses are designed to transform beginners into confident professionals and help experienced engineers stay ahead of rapidly evolving technology. From automotive design to electronics, manufacturing to aerospace, we equip you with the skills that employers demand and industries rely on.',
        whoShouldEnroll: [
          {
            title: 'Engineering Students',
            description: 'Looking to gain practical skills beyond theoretical coursework and stand out in campus placements.'
          },
          {
            title: 'Recent Graduates',
            description: 'Seeking to bridge the gap between academic knowledge and industry requirements with job-ready technical skills.'
          },
          {
            title: 'Career Changers',
            description: 'From non-engineering backgrounds wanting to break into high-demand technical roles in design and manufacturing.'
          },
          {
            title: 'Working Professionals',
            description: 'Aiming to upskill, transition to specialized roles, or take on more challenging projects in their current positions.'
          },
          {
            title: 'Entrepreneurs & Makers',
            description: 'Who want to design and prototype their own products without depending entirely on external design services.'
          },
          {
            title: 'Freelancers & Consultants',
            description: 'Looking to expand their service offerings and work with clients across diverse industries and applications.'
          }
        ],
        whatYouWillLearn: [
          { point: 'Industry-standard workflows used by leading engineering companies worldwide' },
          { point: 'Hands-on project experience with real-world design challenges and specifications' },
          { point: 'Best practices for parametric modeling, assemblies, and technical documentation' },
          { point: 'Simulation and analysis techniques to validate designs before manufacturing' },
          { point: 'How to collaborate effectively in team-based engineering environments' },
          { point: 'Troubleshooting common design problems and optimization strategies' },
          { point: 'Creating manufacturing-ready files and technical drawings to industry standards' },
          { point: 'Keyboard shortcuts, productivity tips, and professional techniques that save hours' },
          { point: 'Portfolio-building projects that demonstrate your skills to potential employers' },
          { point: 'Career guidance and interview preparation for technical engineering roles' }
        ],
        whyChooseUs: [
          {
            title: 'Industry-Experienced Instructors',
            description: 'Learn from professionals who\'ve worked on real projects at major companies. Our instructors bring practical insights you won\'t find in textbooks—the tips, tricks, and workflows that make you efficient and effective.'
          },
          {
            title: 'Project-Based Learning',
            description: 'Forget passive video watching. You\'ll work on actual engineering projects from day one—designing parts, running simulations, creating assemblies—building a professional portfolio that proves your capabilities.'
          },
          {
            title: 'Flexible Learning Schedules',
            description: 'Access courses anytime, anywhere, at your own pace. Whether you\'re a full-time student or working professional, our platform adapts to your schedule with lifetime access to course materials.'
          },
          {
            title: 'Certification & Career Support',
            description: 'Earn industry-recognized certificates that add weight to your resume. Plus, get resume reviews, interview preparation, and job placement assistance to accelerate your career trajectory.'
          },
          {
            title: 'Cutting-Edge Curriculum',
            description: 'Our courses are continuously updated to reflect the latest software versions, industry trends, and employer requirements. You learn what\'s current, not outdated techniques from years ago.'
          },
          {
            title: 'Community & Mentorship',
            description: 'Join a thriving community of learners and professionals. Get your doubts clarified, share projects, network with peers, and receive personalized mentorship throughout your learning journey.'
          }
        ],
        faqs: [
          {
            question: 'Do I need prior engineering knowledge to start these courses?',
            answer: 'For beginner-level courses like AutoCAD and Fusion 360, no prior experience is required—we start from the basics. However, advanced courses like CATIA V5 and Siemens NX assume you have fundamental CAD knowledge. Each course clearly states its prerequisites so you can choose appropriately.'
          },
          {
            question: 'What software do I need, and is it expensive?',
            answer: 'Most software companies offer free student or trial versions that work perfectly for learning. We provide detailed guides on obtaining educational licenses for AutoCAD, SOLIDWORKS, ANSYS, and others. For professional use, subscription costs vary, but the investment pays off quickly with enhanced career opportunities.'
          },
          {
            question: 'How much time should I dedicate weekly to complete a course?',
            answer: 'We recommend 5-8 hours per week for optimal learning, but our self-paced format lets you adjust based on your schedule. Some students complete courses faster by dedicating more time, while working professionals spread learning over a longer period. Consistency matters more than speed.'
          },
          {
            question: 'Will I get a certificate, and is it recognized by employers?',
            answer: 'Yes, you receive a certificate of completion for every course. While our certificates demonstrate your commitment and learning, employers ultimately value demonstrated skills. That\'s why we emphasize project-based learning—your portfolio of completed projects often matters more than certificates alone.'
          },
          {
            question: 'Can I get job placement assistance after completing courses?',
            answer: 'Absolutely. We offer resume reviews, portfolio guidance, mock interviews, and job referrals to our hiring partners. Many of our graduates have secured positions at leading engineering firms, startups, and consultancies. We also have an active alumni network that shares job opportunities.'
          },
          {
            question: 'What if I get stuck or need help during the course?',
            answer: 'You\'re never alone. Each course includes discussion forums, direct instructor support, and community mentorship. Most questions get answered within 24 hours. Additionally, we host live Q&A sessions where you can interact with instructors and clarify doubts in real-time.'
          }
        ],
        isActive: true
      });
    }

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    next(error);
  }
};

// Update course page configuration (Admin only)
exports.updateCoursePageConfig = async (req, res, next) => {
  try {
    const { 
      heroTitle, 
      heroDescription, 
      whoShouldEnroll, 
      whatYouWillLearn, 
      whyChooseUs, 
      faqs 
    } = req.body;

    let config = await CoursePage.findOne({ isActive: true });

    if (!config) {
      config = new CoursePage();
    }

    // Update fields
    if (heroTitle !== undefined) config.heroTitle = heroTitle;
    if (heroDescription !== undefined) config.heroDescription = heroDescription;
    if (whoShouldEnroll !== undefined) config.whoShouldEnroll = whoShouldEnroll;
    if (whatYouWillLearn !== undefined) config.whatYouWillLearn = whatYouWillLearn;
    if (whyChooseUs !== undefined) config.whyChooseUs = whyChooseUs;
    if (faqs !== undefined) config.faqs = faqs;

    config.isActive = true;
    await config.save();

    res.status(200).json({
      success: true,
      message: 'Course page configuration updated successfully',
      data: config
    });
  } catch (error) {
    next(error);
  }
};
