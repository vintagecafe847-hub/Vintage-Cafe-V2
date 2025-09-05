# Smart Review System Setup Guide

## Overview

The Smart Review System is a React component that intelligently routes customer feedback based on their star rating:

- **4-5 stars**: Redirects to Google Business Profile for public reviews
- **1-3 stars**: Shows private feedback form to collect improvement suggestions

## 🚀 Quick Start

### 1. Google Business Profile Setup

#### Getting Your Google Review Link

1. Go to [Google My Business](https://business.google.com/)
2. Sign in with your business account
3. Select your "Vintage Cafe Schaumburg" listing
4. Navigate to "Reviews" section
5. Click "Get more reviews"
6. Copy the review link that looks like:
   ```
   https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID
   ```

#### Finding Your Place ID (Alternative Method)

1. Go to [Google Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
2. Search for "Vintage Cafe Schaumburg, IL"
3. Copy the Place ID
4. Use this format: `https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID`

#### Update the Component

Replace the `GOOGLE_REVIEW_URL` in `SmartReviewSystem.tsx`:

```typescript
const GOOGLE_REVIEW_URL = 'YOUR_ACTUAL_GOOGLE_REVIEW_URL';
```

### 2. Resend.com Email Service Setup

#### Create Resend Account

1. Go to [Resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free tier)
3. Verify your email address

#### Domain Setup (Recommended)

1. In Resend dashboard, go to "Domains"
2. Add your domain (e.g., `vintagecafeschaumburg.com`)
3. Add the provided DNS records to your domain
4. Wait for verification (can take up to 24 hours)

#### Get API Key

1. Go to "API Keys" in Resend dashboard
2. Click "Create API Key"
3. Name it "Vintage Cafe Reviews"
4. Copy the API key (starts with `re_`)

#### Environment Variables

Add to your `.env` file (create if it doesn't exist):

```env
RESEND_API_KEY=re_your_api_key_here
```

**Important**: Add `.env` to your `.gitignore` file to keep your API key secure.

### 3. Deployment Setup

#### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. In Vercel dashboard, go to your project settings
3. Navigate to "Environment Variables"
4. Add `RESEND_API_KEY` with your Resend API key
5. Deploy your site

#### Netlify Deployment

1. Connect your GitHub repository to Netlify
2. In Netlify dashboard, go to Site Settings
3. Navigate to "Environment Variables"
4. Add `RESEND_API_KEY` with your Resend API key
5. Deploy your site

### 4. Email Configuration

#### Update "From" Email Address

In `api/send-review-feedback.js`, update the from address:

```javascript
from: 'Vintage Cafe Reviews <reviews@yourdomain.com>',
```

Options:

- If you verified a domain: `reviews@yourdomain.com`
- If using Resend's domain: `reviews@resend.dev`
- Default for testing: `onboarding@resend.dev`

#### Update Recipient Email

Change the business email in the same file:

```javascript
to: ['vintagecafeschaumburg@gmail.com'], // Your actual business email
```

## 📱 Component Integration

### Already Integrated

The component is already added to your `HomePage.tsx` and will appear between the Reviews Slider and Contact sections.

### Manual Integration (if needed)

```typescript
import SmartReviewSystem from '../components/SmartReviewSystem';

// In your component
<SmartReviewSystem />;
```

## 🎨 Customization

### Styling

The component uses your existing design system:

- Colors: `#D8A24A` (golden), `#3B2A20` (brown), `#FEF7F3` (cream)
- Fonts: Prata for headings, system fonts for body text
- Icons: Lucide React icons (already in your project)

### Modify Behavior

In `SmartReviewSystem.tsx`:

#### Change Rating Threshold

```typescript
if (selectedRating >= 4) {
  // Change to >= 5 for only 5-star redirects
  // Change to >= 3 for 3+ star redirects
}
```

#### Customize Messages

Update the text in the component for your brand voice.

## 🧪 Testing

### Test the Component

1. Start your development server: `npm run dev`
2. Navigate to your homepage
3. Scroll to the review section
4. Test both rating scenarios:
   - Rate 5 stars → Should redirect to Google
   - Rate 2 stars → Should show feedback form

### Test Email Functionality

1. Use the feedback form with a low rating
2. Check your business email for the feedback
3. Verify the email formatting and content

## 🔧 Troubleshooting

### Common Issues

#### API Key Not Working

- Verify the API key is correct in environment variables
- Check that the key starts with `re_`
- Ensure environment variables are deployed to your hosting platform

#### Google Redirect Not Working

- Verify your Google Business Profile is active
- Check that the Place ID is correct
- Test the Google review URL manually in a browser

#### Emails Not Sending

- Check Resend dashboard for error logs
- Verify your domain is properly configured
- Check spam folder for test emails
- Ensure recipient email address is correct

#### Component Not Appearing

- Check browser console for errors
- Verify the component import is correct
- Ensure all dependencies are installed

### Getting Help

1. Check Resend documentation: [resend.com/docs](https://resend.com/docs)
2. Google Business Profile help: [support.google.com](https://support.google.com/business)
3. Component issues: Check browser developer tools console

## 📊 Analytics & Monitoring

### Track Performance

- Monitor email delivery in Resend dashboard
- Check Google Business Profile for new reviews
- Use browser analytics to track component engagement

### A/B Testing Ideas

- Test different rating thresholds
- Try different messaging approaches
- Experiment with visual designs

## 🔒 Security Considerations

### Environment Variables

- Never commit API keys to version control
- Use different API keys for development and production
- Regularly rotate API keys

### Email Security

- Validate all user inputs
- Sanitize email content
- Monitor for spam or abuse

## 📈 Best Practices

### User Experience

- Keep the interface simple and intuitive
- Provide clear feedback on all actions
- Handle errors gracefully

### Business Impact

- Respond quickly to negative feedback emails
- Thank customers for positive reviews
- Use feedback to improve your service

## 🎯 Next Steps

1. ✅ Set up Google Business Profile review link
2. ✅ Configure Resend.com account and API key
3. ✅ Deploy with environment variables
4. ✅ Test the complete flow
5. ✅ Monitor and respond to feedback
6. Consider adding analytics tracking
7. Plan A/B tests for optimization

---

**Need Help?**
Contact your developer with specific error messages or check the troubleshooting section above.
