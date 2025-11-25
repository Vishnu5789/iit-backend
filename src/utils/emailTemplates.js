/**
 * Generate password reset email HTML template
 */
const getPasswordResetTemplate = (resetUrl, userName) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .title {
          font-size: 24px;
          color: #1f2937;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .content {
          color: #4b5563;
          margin-bottom: 30px;
        }
        .button-container {
          text-align: center;
          margin: 35px 0;
        }
        .reset-button {
          display: inline-block;
          padding: 14px 40px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
          transition: all 0.3s ease;
        }
        .reset-button:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          box-shadow: 0 6px 8px rgba(37, 99, 235, 0.4);
        }
        .alternative-link {
          background-color: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
          word-break: break-all;
          font-size: 14px;
          color: #6b7280;
          margin: 20px 0;
        }
        .expiry-notice {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          font-size: 14px;
        }
        .security-notice {
          background-color: #fee2e2;
          border-left: 4px solid #ef4444;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .footer-links {
          margin-top: 15px;
        }
        .footer-link {
          color: #2563eb;
          text-decoration: none;
          margin: 0 10px;
        }
        .icon {
          display: inline-block;
          width: 20px;
          height: 20px;
          margin-right: 8px;
          vertical-align: middle;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎓 Isaac Institute of Technology</div>
        </div>
        
        <h1 class="title">Reset Your Password</h1>
        
        <div class="content">
          <p>Hello ${userName || 'there'},</p>
          
          <p>We received a request to reset the password for your account. If you made this request, click the button below to create a new password:</p>
        </div>
        
        <div class="button-container">
          <table cellpadding="0" cellspacing="0" border="0" align="center">
            <tr>
              <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);">
                <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                  Reset My Password
                </a>
              </td>
            </tr>
          </table>
        </div>
        
        <div class="expiry-notice">
          <strong>⏰ Time-Sensitive:</strong> This password reset link will expire in <strong>1 hour</strong> for security reasons.
        </div>
        
        <div class="content">
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <div class="alternative-link">
            <a href="${resetUrl}" target="_blank" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
          </div>
        </div>
        
        <div class="security-notice">
          <strong>🔒 Security Notice:</strong> If you didn't request a password reset, please ignore this email or contact support if you're concerned about unauthorized access to your account. Your password will remain unchanged.
        </div>
        
        <div class="footer">
          <p><strong>Isaac Institute of Technology</strong></p>
          <p>Empowering Design Engineers with Practical Skills</p>
          <div class="footer-links">
            <a href="#" class="footer-link">Help Center</a> •
            <a href="#" class="footer-link">Contact Support</a> •
            <a href="#" class="footer-link">Privacy Policy</a>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate password reset success email template
 */
const getPasswordResetSuccessTemplate = (userName) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Successful</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .success-icon {
          font-size: 60px;
          margin: 20px 0;
        }
        .title {
          font-size: 24px;
          color: #10b981;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .content {
          color: #4b5563;
          margin-bottom: 20px;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .login-button {
          display: inline-block;
          padding: 14px 40px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
        }
        .security-tip {
          background-color: #dbeafe;
          border-left: 4px solid #2563eb;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎓 Isaac Institute of Technology</div>
          <div class="success-icon">✅</div>
        </div>
        
        <h1 class="title">Password Reset Successful!</h1>
        
        <div class="content">
          <p>Hello ${userName || 'there'},</p>
          
          <p>Your password has been successfully reset. You can now log in to your account using your new password.</p>
        </div>
        
        <div class="button-container">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="login-button">Login to Your Account</a>
        </div>
        
        <div class="security-tip">
          <strong>🔐 Security Tips:</strong>
          <ul style="margin: 10px 0 0 20px; padding: 0;">
            <li>Never share your password with anyone</li>
            <li>Use a unique password for your account</li>
            <li>Enable two-factor authentication if available</li>
            <li>Regularly update your password</li>
          </ul>
        </div>
        
        <div class="content">
          <p>If you did not perform this password reset, please contact our support team immediately at <strong>support@isaactech.com</strong></p>
        </div>
        
        <div class="footer">
          <p><strong>Isaac Institute of Technology</strong></p>
          <p>Empowering Design Engineers with Practical Skills</p>
          <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  getPasswordResetTemplate,
  getPasswordResetSuccessTemplate
};

