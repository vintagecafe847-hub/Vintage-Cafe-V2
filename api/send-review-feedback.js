import { Resend } from 'resend';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return res.status(500).json({
        success: false,
        message: 'Email service not configured',
      });
    }

    // Initialize Resend with the API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { rating, email, comments } = req.body;

    // Input sanitization
    const sanitizeInput = (input) => {
      if (typeof input !== 'string') return '';
      return input
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    };

    const sanitizedEmail = sanitizeInput(email);
    const sanitizedComments = sanitizeInput(comments);

    // Validate required fields - email is optional for ratings 3 and below
    if (!rating || !sanitizedComments) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: rating and comments are required',
      });
    }

    // Email is only required for ratings 4 and 5
    if (rating >= 4 && (!sanitizedEmail || sanitizedEmail.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for ratings of 4 stars and above',
      });
    }

    // Validate rating is between 1-5
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Length validation to prevent spam
    if (sanitizedComments.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Comments must be less than 2000 characters',
      });
    }

    // Email validation (only if provided)
    if (sanitizedEmail && sanitizedEmail.length > 0) {
      const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(sanitizedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address',
        });
      }
    }

    // Spam detection for comments
    const spamPatterns = [
      /viagra|cialis|casino|lottery|winner|congratulations/i,
      /click here|visit our website|make money|get rich/i,
      /urgent|act now|limited time|expire/i,
    ];

    const isSpam = spamPatterns.some((pattern) =>
      pattern.test(sanitizedComments.toLowerCase())
    );

    if (isSpam) {
      return res.status(400).json({
        success: false,
        message: 'Review appears to be spam and cannot be processed',
      });
    }

    // Generate star display for email
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Vintage Cafe Reviews <reviews@vintagecafeschaumburg.com>',
      to: ['vintagecafeschaumburg@gmail.com'], // Your business email
      subject: `Customer Feedback - ${rating} Star Review`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Customer Feedback</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f8f9fa;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #D8A24A, #c9a876);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .rating {
              font-size: 32px;
              margin: 10px 0;
              letter-spacing: 2px;
            }
            .content {
              padding: 30px;
            }
            .field {
              margin-bottom: 20px;
            }
            .field-label {
              font-weight: 600;
              color: #3B2A20;
              margin-bottom: 8px;
              display: block;
            }
            .field-value {
              background: #f8f9fa;
              padding: 12px;
              border-radius: 8px;
              border-left: 4px solid #D8A24A;
            }
            .footer {
              background: #3B2A20;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 14px;
            }
            .timestamp {
              color: #666;
              font-size: 14px;
              margin-top: 20px;
              text-align: center;
            }
            .priority-notice {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 20px;
            }
            .priority-notice.low-rating {
              background: #f8d7da;
              border-color: #f5c6cb;
              color: #721c24;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Customer Feedback Received</h1>
              <div class="rating">${stars}</div>
              <p>${rating} out of 5 stars</p>
            </div>
            
            <div class="content">
              ${
                rating <= 3
                  ? `
                <div class="priority-notice low-rating">
                  <strong>⚠️ Low Rating Alert:</strong> This customer had a less than ideal experience. Please follow up promptly to address their concerns.
                </div>
              `
                  : ''
              }
              
              <div class="field">
                <span class="field-label">Customer Email:</span>
                <div class="field-value">${
                  sanitizedEmail || 'Not provided (rating 3 or below)'
                }</div>
              </div>
              
              <div class="field">
                <span class="field-label">Rating:</span>
                <div class="field-value">${rating} out of 5 stars (${stars})</div>
              </div>
              
              <div class="field">
                <span class="field-label">Customer Feedback:</span>
                <div class="field-value">${sanitizedComments.replace(
                  /\n/g,
                  '<br>'
                )}</div>
              </div>
              
              <div class="timestamp">
                Received on ${new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short',
                })}
              </div>
            </div>
            
            <div class="footer">
              <p>Vintage Cafe Schaumburg - Customer Feedback System</p>
              <p>105 E Schaumburg Rd, Schaumburg, IL 60194</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Customer Feedback Received

Rating: ${rating} out of 5 stars
Customer Email: ${sanitizedEmail || 'Not provided (rating 3 or below)'}

Feedback:
${sanitizedComments}

${
  rating <= 3
    ? 'LOW RATING ALERT: Please follow up with this customer promptly.'
    : ''
}

Received on ${new Date().toLocaleString()}

Vintage Cafe Schaumburg
105 E Schaumburg Rd, Schaumburg, IL 60194
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send feedback email',
        error: error.message,
      });
    }

    console.log('Feedback email sent successfully:', data);

    // Return success response
    return res.status(200).json({
      success: true,
      message:
        'Thank you for your feedback! We appreciate you taking the time to help us improve.',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while processing your feedback',
    });
  }
}
