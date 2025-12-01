const ContactWidget = require('../models/ContactWidget');

// Get contact widget configuration
exports.getContactWidget = async (req, res) => {
  try {
    let config = await ContactWidget.findOne();
    
    // If no config exists, return default values (don't save to DB yet)
    if (!config) {
      return res.json({
        success: true,
        data: {
          isEnabled: false,
          whatsappNumber: '',
          phoneNumber: '',
          email: '',
          position: 'bottom-right',
          showOnPages: ['all'],
          chatbotEnabled: false,
          chatbotScript: '',
          customMessage: 'How can we help you today?'
        }
      });
    }
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching contact widget config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact widget configuration',
      error: error.message
    });
  }
};

// Update contact widget configuration (Admin only)
exports.updateContactWidget = async (req, res) => {
  try {
    console.log('📝 Updating contact widget config...');
    console.log('Request body:', req.body);
    
    const {
      isEnabled,
      whatsappNumber,
      phoneNumber,
      email,
      position,
      showOnPages,
      chatbotEnabled,
      chatbotScript,
      customMessage
    } = req.body;
    
    console.log('showOnPages received:', showOnPages);
    
    let config = await ContactWidget.findOne();
    
    if (!config) {
      // Create new config
      console.log('Creating new config...');
      config = await ContactWidget.create({
        ...req.body,
        updatedBy: req.user._id
      });
      console.log('✅ New config created:', config);
    } else {
      // Update existing config
      console.log('Updating existing config...');
      if (isEnabled !== undefined) config.isEnabled = isEnabled;
      if (whatsappNumber !== undefined) config.whatsappNumber = whatsappNumber;
      if (phoneNumber !== undefined) config.phoneNumber = phoneNumber;
      if (email !== undefined) config.email = email;
      if (position !== undefined) config.position = position;
      if (showOnPages !== undefined) {
        console.log('Setting showOnPages to:', showOnPages);
        config.showOnPages = showOnPages;
      }
      if (chatbotEnabled !== undefined) config.chatbotEnabled = chatbotEnabled;
      if (chatbotScript !== undefined) config.chatbotScript = chatbotScript;
      if (customMessage !== undefined) config.customMessage = customMessage;
      config.updatedBy = req.user._id;
      
      await config.save();
      console.log('✅ Config updated:', config);
    }
    
    console.log('Final showOnPages in DB:', config.showOnPages);
    
    res.json({
      success: true,
      message: 'Contact widget configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('❌ Error updating contact widget config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact widget configuration',
      error: error.message
    });
  }
};

