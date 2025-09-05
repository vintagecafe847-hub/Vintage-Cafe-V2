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

    const { name, email, phone, subject, message } = req.body;

    // Input sanitization and validation
    const sanitizeInput = (input) => {
      if (typeof input !== 'string') return '';
      return input
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    };

    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPhone = sanitizeInput(phone);
    const sanitizedSubject = sanitizeInput(subject);
    const sanitizedMessage = sanitizeInput(message);

    // Length validation to prevent spam
    if (sanitizedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Name must be less than 100 characters',
      });
    }

    if (sanitizedSubject.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Subject must be less than 200 characters',
      });
    }

    if (sanitizedMessage.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Message must be less than 5000 characters',
      });
    }

    // Required field validation
    if (
      !sanitizedName ||
      !sanitizedEmail ||
      !sanitizedSubject ||
      !sanitizedMessage
    ) {
      return res.status(400).json({
        success: false,
        message:
          'All required fields must be filled (name, email, subject, message)',
      });
    }

    // Email validation (more robust)
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Phone validation (optional but validate if provided)
    if (sanitizedPhone) {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,20}$/;
      if (!phoneRegex.test(sanitizedPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid phone number',
        });
      }
    }

    // Spam detection - basic patterns
    const spamPatterns = [
      /viagra|cialis|casino|lottery|winner|congratulations/i,
      /click here|visit our website|make money|get rich/i,
      /urgent|act now|limited time|expire/i,
    ];

    const textToCheck =
      `${sanitizedName} ${sanitizedSubject} ${sanitizedMessage}`.toLowerCase();
    const isSpam = spamPatterns.some((pattern) => pattern.test(textToCheck));

    if (isSpam) {
      return res.status(400).json({
        success: false,
        message: 'Message appears to be spam and cannot be processed',
      });
    }

    // Send email notification via Resend
    const emailData = await resend.emails.send({
      from: 'Vintage Cafe Contact <onboarding@resend.dev>',
      to: ['sallam.mn@gmail.com'],
      subject: `Vintage Cafe Contact: ${name} - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #92400e; border-bottom: 2px solid #d97706; padding-bottom: 10px;">
            ☕ New Contact from Vintage Cafe Website
          </h2>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
            <h3 style="margin-top: 0; color: #92400e;">Contact Details</h3>
            <p><strong>Name:</strong> ${sanitizedName}</p>
            <p><strong>Email:</strong> ${sanitizedEmail}</p>
            ${
              sanitizedPhone
                ? `<p><strong>Phone:</strong> ${sanitizedPhone}</p>`
                : ''
            }
            <p><strong>Subject:</strong> ${sanitizedSubject}</p>
          </div>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Message</h3>
            <p style="white-space: pre-wrap; color: #374151; line-height: 1.6;">${sanitizedMessage}</p>
          </div>

          <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #065f46; font-size: 14px;">
              📧 This contact form was submitted through the Vintage Cafe website.
            </p>
            <p style="margin: 5px 0 0 0; color: #065f46; font-size: 12px;">
              Received: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    });

    console.log('Resend API response:', emailData);

    // Check if email was sent successfully
    if (emailData && emailData.id) {
      return res.status(200).json({
        success: true,
        message: "Message sent successfully! We'll get back to you soon.",
      });
    } else {
      console.error('Email sending failed - no ID returned:', emailData);
      return res.status(500).json({
        success: false,
        message: 'Failed to send email. Please try again.',
      });
    }
  } catch (error) {
    console.error('Error processing contact form:', error);
    return res.status(500).json({
      success: false,
      message:
        'An error occurred while sending your message. Please try again.',
    });
  }
}
