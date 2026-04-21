# Google Analytics Setup Guide

This guide explains how to set up Google Analytics 4 (GA4) to track website visitors on your Kuepass application.

## Overview

Google Analytics has been integrated into the application to track:
- **Page views** - Automatically tracked on every route change
- **Visitor statistics** - Number of visitors, sessions, page views
- **User behavior** - Which pages are most visited, bounce rate, session duration
- **Custom events** - Track specific user actions (optional)

## Setup Instructions

### Step 1: Create a Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click **"Admin"** (gear icon) in the bottom left
4. Click **"Create Property"** (if you don't have one yet)
5. Fill in your property details:
   - Property name: `Kuepass Website` (or your preferred name)
   - Reporting time zone: Select your timezone
   - Currency: Select your currency
6. Click **"Next"** and complete the setup

### Step 2: Get Your Measurement ID

1. In Google Analytics, go to **Admin** > **Data Streams**
2. Click on your web data stream (or create one if needed)
3. You'll see your **Measurement ID** (format: `G-XXXXXXXXXX`)
4. Copy this ID - you'll need it in the next step

### Step 3: Configure Environment Variable

Add your Google Analytics Measurement ID to your environment variables:

**For local development (`/.env.local`):**
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**For production:**
Add the same environment variable to your hosting platform (Vercel, Netlify, etc.):
- Variable name: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- Variable value: `G-XXXXXXXXXX` (your actual Measurement ID)

### Step 4: Verify It's Working

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your website in a browser

3. In Google Analytics, go to **Reports** > **Realtime**
   - You should see your visit appear within a few seconds
   - Note: It may take a few minutes to show up initially

## Features

### Automatic Page View Tracking

The application automatically tracks page views when users navigate between pages. No additional code is needed.

### Custom Event Tracking (Optional)

If you want to track custom events (e.g., button clicks, form submissions), you can use the `useAnalytics` hook:

```tsx
import { useAnalytics } from "@/components/GoogleAnalytics";

function MyComponent() {
  const { trackEvent } = useAnalytics();

  const handleButtonClick = () => {
    trackEvent("click", "button", "register_now", 1);
    // Your button logic here
  };

  return <button onClick={handleButtonClick}>Register Now</button>;
}
```

**Event parameters:**
- `action`: The action being tracked (e.g., "click", "submit", "download")
- `category`: The category of the event (e.g., "button", "form", "video")
- `label`: Optional label to provide more context
- `value`: Optional numeric value

## Viewing Your Analytics Data

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. View different reports:
   - **Realtime**: See current visitors (updates in real-time)
   - **Overview**: General website statistics
   - **Acquisition**: Where your visitors come from
   - **Engagement**: How visitors interact with your site
   - **Demographics**: Visitor location, device, browser info

## Troubleshooting

### Analytics not showing data

1. **Check environment variable**: Ensure `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set correctly
2. **Check browser console**: Look for any errors related to Google Analytics
3. **Verify Measurement ID**: Make sure it starts with `G-` (GA4 format)
4. **Wait a few minutes**: Data can take 24-48 hours to appear in standard reports (Realtime shows immediately)
5. **Check ad blockers**: Some ad blockers prevent Google Analytics from loading

### Development vs Production

- The same Measurement ID works for both development and production
- If you want separate tracking, create two GA4 properties and use different Measurement IDs
- Use environment variables to switch between them

## Privacy Considerations

Google Analytics collects visitor data. Make sure to:
- Add a privacy policy to your website
- Comply with GDPR, CCPA, or other privacy regulations in your region
- Consider adding a cookie consent banner if required by law

## Additional Resources

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [GA4 Setup Assistant](https://support.google.com/analytics/answer/9304153)
- [GA4 Realtime Reports](https://support.google.com/analytics/answer/9271392)

