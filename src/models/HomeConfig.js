const mongoose = require('mongoose');

const homeConfigSchema = new mongoose.Schema({
  heroImage: {
    url: String,
    fileId: String
  },
  starsImage: {
    url: String,
    fileId: String
  },
  visionImage: {
    url: String,
    fileId: String
  },
  teamCollaborationImage: {
    url: String,
    fileId: String
  },
  goalsImage: {
    url: String,
    fileId: String
  },
  journeyImage: {
    url: String,
    fileId: String
  },
  stats: {
    studentsCount: {
      type: String,
      default: '10K+'
    },
    coursesCount: {
      type: String,
      default: '50+'
    },
    averageRating: {
      type: String,
      default: '4.8★'
    }
  },
  heroText: {
    badge: {
      type: String,
      default: 'Engineering is Future'
    },
    headline: {
      type: String,
      default: 'Master the Skills That Build Tomorrow'
    },
    description: {
      type: String,
      default: 'Learn CAD, CAE, PCB Design, and Programming from industry experts. Join thousands of engineers shaping the future of technology.'
    }
  },
  // Mission Section
  missionSection: {
    title: {
      type: String,
      default: 'Engineering the Future, One Student at a Time'
    },
    paragraph1: {
      type: String,
      default: 'In a rapidly evolving tech landscape, engineers need more than theory—they need practical, cutting-edge skills. We bridge that gap with expert-led courses designed for real-world impact.'
    },
    paragraph2: {
      type: String,
      default: 'Founded by industry veterans from SpaceX, Tesla, and Apple, Isaac Institute equips engineers with the tools, knowledge, and confidence to shape tomorrow\'s innovations. The future is engineering—and it starts here.'
    }
  },
  // Mission & Vision Section
  missionVisionSection: {
    title: {
      type: String,
      default: 'Our Mission & Vision'
    },
    mission: {
      type: String,
      default: 'Our Mission: To empower every design engineer with the practical skills, theoretical depth, and innovative mindset required to solve complex challenges and lead the future of product development.'
    },
    vision: {
      type: String,
      default: 'Our Vision: A world where engineering education is no longer a barrier to innovation, but its catalyst. We envision a global community where engineers can continuously learn, apply, and excel throughout their careers.'
    }
  },
  // Pedagogy Section
  pedagogySection: {
    title: {
      type: String,
      default: 'More Than a Tutorial. A Transformation.'
    },
    description: {
      type: String,
      default: 'We\'ve built our curriculum on a core set of learning principles that ensure real, tangible skill development.'
    },
    principles: [{
      title: {
        type: String,
        default: ''
      },
      description: {
        type: String,
        default: ''
      }
    }]
  },
  // Core Values Section
  coreValuesSection: {
    title: {
      type: String,
      default: 'Our Core Values'
    },
    values: [{
      name: {
        type: String,
        default: ''
      },
      description: {
        type: String,
        default: ''
      }
    }]
  },
  // Join Journey Section
  joinJourneySection: {
    title: {
      type: String,
      default: 'Ready to Redefine What You Can Design?'
    },
    description: {
      type: String,
      default: 'Whether you\'re an aspiring engineer, a seasoned professional looking to specialize, or a manager aiming to upskill your team, Isaac Institute of Technology is your partner in professional growth.'
    },
    button1: {
      text: {
        type: String,
        default: 'Explore Our Courses'
      },
      link: {
        type: String,
        default: '/courses'
      }
    },
    button2: {
      text: {
        type: String,
        default: 'View Our Instructor Team'
      },
      link: {
        type: String,
        default: '/about'
      }
    },
    button3: {
      text: {
        type: String,
        default: 'Contact Us for Team Training'
      },
      link: {
        type: String,
        default: '/contact'
      }
    }
  },
  // Why Choose Us Section (moved to bottom)
  whyChooseUsSection: {
    title: {
      type: String,
      default: 'Why Isaac Institute?'
    },
    subtitle: {
      type: String,
      default: 'We\'re revolutionizing engineering education for the digital age'
    },
    features: [{
      icon: {
        type: String,
        default: '🚀'
      },
      title: {
        type: String,
        default: 'Industry Experts'
      },
      description: {
        type: String,
        default: 'Learn from professionals at SpaceX, Apple, Tesla, and more'
      }
    }]
  },
  // Instructors Section
  instructorsSection: {
    title: {
      type: String,
      default: 'Learn from the Best in the Industry'
    },
    subtitle: {
      type: String,
      default: 'Our instructors are industry veterans from SpaceX, Tesla, Apple, and leading tech companies'
    }
  }
}, {
  timestamps: true
});

// Ensure only one config document exists
homeConfigSchema.index({}, { unique: true });

const HomeConfig = mongoose.model('HomeConfig', homeConfigSchema);

module.exports = HomeConfig;

