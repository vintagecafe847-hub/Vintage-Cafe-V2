# Email Setup Instructions

This project uses Resend.com for sending contact form emails.

## Production Setup (Vercel)

1. **Get your Resend API key** from [https://resend.com/api-keys](https://resend.com/api-keys)

2. **Deploy to Vercel**:

   - Push your code to GitHub
   - Connect your repository to Vercel
   - In your Vercel project dashboard, go to Settings → Environment Variables
   - Add: `RESEND_API_KEY` = your_actual_resend_api_key
   - Redeploy if necessary

3. **That's it!** The contact form will work automatically.

4. Run the development server using Vercel CLI to enable API functions:

   ```bash
   vercel dev
   ```

   Or use the regular Vite dev server (API functions won't work locally):

   ```bash
   npm run dev
   ```

## How it works

- Contact form submissions are sent to `/api/send-contact-email`
- The API function validates the form data and sends an email to `sallam.mn@gmail.com`
- Uses Resend.com service with the `onboarding@resend.dev` sender address
- Includes all form details (name, email, phone, subject, message) in the email
- Returns success/error status to show appropriate feedback to the user

## Email Template

The email includes:

- Contact person's details (name, email, phone)
- Subject line
- Message content
- Timestamp of submission
- Professional HTML formatting with Vintage Cafe branding colors

## Local Development

For local development, the contact form will show an error (since the API won't work locally without Vercel CLI). This is normal and the form will work perfectly once deployed to Vercel.
