# Google Business Profile Configuration

## Your Business Information

- **Business Name**: Vintage Cafe Schaumburg
- **Address**: 105 E Schaumburg Rd, Schaumburg, IL 60194
- **Phone**: (630) 400-5155

## Current Google Place ID

Based on your address, your Google Place ID appears to be:
`ChIJi6rB1c4mDogRJzjgHcQnFT8`

## Your Google Review URL

Replace the placeholder in `SmartReviewSystem.tsx` with:

```
https://search.google.com/local/writereview?placeid=ChIJi6rB1c4mDogRJzjgHcQnFT8
```

## How to Verify This is Correct

1. **Test the URL**: Paste the URL above into your browser
2. **Check Business Name**: It should show "Vintage Cafe" or your business name
3. **Verify Address**: Should match 105 E Schaumburg Rd, Schaumburg, IL

## Alternative Methods to Get Your Place ID

### Method 1: Google My Business

1. Go to [business.google.com](https://business.google.com)
2. Select your business listing
3. Look for "Customer reviews" or "Ask for reviews"
4. Copy the review link

### Method 2: Google Maps

1. Search for your business on Google Maps
2. Share the business page
3. The URL will contain your Place ID

### Method 3: Google Place ID Finder

1. Visit [developers.google.com/maps/documentation/places/web-service/place-id](https://developers.google.com/maps/documentation/places/web-service/place-id)
2. Search for "Vintage Cafe Schaumburg"
3. Copy the Place ID

## Updating the Component

In `src/components/SmartReviewSystem.tsx`, find this line:

```typescript
const GOOGLE_REVIEW_URL =
  'https://search.google.com/local/writereview?placeid=ChIJi6rB1c4mDogRJzjgHcQnFT8';
```

Replace with your actual Google review URL when you verify it's correct.
