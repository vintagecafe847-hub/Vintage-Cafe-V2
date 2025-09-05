# Testing the Smart Review System

## Quick Test Checklist

### 1. Visual Test

- [ ] Component loads without errors
- [ ] Stars are visible and clickable
- [ ] Design matches the rest of the site
- [ ] Mobile responsive design works

### 2. High Rating Test (4-5 Stars)

- [ ] Click 5 stars
- [ ] See "Thank you for the great rating!" message
- [ ] Redirected to Google Business Profile (new tab)
- [ ] Can return and see thank you message

### 3. Low Rating Test (1-3 Stars)

- [ ] Click 2 stars
- [ ] Feedback form appears
- [ ] Email validation works
- [ ] Comments validation works
- [ ] Can submit feedback successfully
- [ ] Receive thank you message

### 4. Email Test

- [ ] Submit low rating feedback
- [ ] Check business email for feedback
- [ ] Verify email contains all information
- [ ] Email formatting looks professional

### 5. Reset Test

- [ ] "Leave Another Review" button works
- [ ] Component resets to initial state
- [ ] Can submit multiple reviews

## Test Data

### Test Email Addresses

Use these for testing (don't use real customer emails):

- test@example.com
- review-test@gmail.com
- feedback-test@outlook.com

### Test Comments

- "The coffee was cold and service was slow."
- "Great atmosphere but the food could be better."
- "Loved everything! Amazing experience!"

## Manual Test Script

1. **Open the website**

   - Navigate to homepage
   - Scroll to review section

2. **Test High Rating Flow**

   ```
   1. Click 5 stars
   2. Wait for redirect message
   3. Verify Google link opens in new tab
   4. Return to original tab
   5. Verify thank you message appears
   ```

3. **Test Low Rating Flow**

   ```
   1. Click "Leave Another Review"
   2. Click 2 stars
   3. Fill email: test@example.com
   4. Fill comments: "Coffee was cold"
   5. Click "Send Feedback"
   6. Verify success message
   ```

4. **Verify Email**
   - Check vintagecafeschaumburg@gmail.com
   - Look for feedback email
   - Verify all information is included

## Troubleshooting

### If Component Doesn't Load

- Check browser console for errors
- Verify React import is correct
- Check if Lucide React icons are installed

### If Email Doesn't Send

- Check Resend dashboard for errors
- Verify API key in environment variables
- Check spam folder

### If Google Redirect Doesn't Work

- Verify Google Business Profile URL
- Check if popup blocker is enabled
- Test URL manually in browser

## Production Checklist

Before going live:

- [ ] Real Google Business Profile URL configured
- [ ] Resend API key is production key
- [ ] Business email address is correct
- [ ] Component styling matches brand
- [ ] All test scenarios pass
- [ ] Mobile experience tested
- [ ] Error handling tested
