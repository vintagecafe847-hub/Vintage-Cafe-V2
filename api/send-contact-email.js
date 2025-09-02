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

    // Log for debugging (remove in production)
    console.log('Processing contact form submission:', {
      name,
      email,
      subject,
    });
    console.log('API Key configured:', !!process.env.RESEND_API_KEY);

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message:
          'All required fields must be filled (name, email, subject, message)',
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Phone validation (optional but validate if provided)
    if (phone) {
      // Basic phone validation - should contain only numbers, spaces, hyphens, parentheses, plus
      const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid phone number',
        });
      }
    }

    // Send email notification via Resend
    console.log('Attempting to send email via Resend...');

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
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <p><strong>Subject:</strong> ${subject}</p>
          </div>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Message</h3>
            <p style="white-space: pre-wrap; color: #374151; line-height: 1.6;">${message}</p>
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
      console.log('Email sent successfully with ID:', emailData.id);
      return res.status(200).json({
        success: true,
        message: "Message sent successfully! We'll get back to you soon.",
        emailId: emailData.id, // Include for debugging
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
