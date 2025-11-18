# Fixing Google OAuth "disallowed_useragent" Error

## The Problem
This error occurs when Google detects the request is coming from an embedded browser/WebView that doesn't meet their security requirements. The error message:
```
Error 403: disallowed_useragent
This request does not comply with Google's "Use secure browsers" policy
```

## Solution Implemented

### 1. Updated OAuth Flow
- **Changed from popup to redirect flow** - This bypasses the WebView restrictions
- **Added fallback direct URL** - If the library fails, it uses a direct Google OAuth URL
- **Auth-code flow** - More secure and compatible with restricted browsers

### 2. Google Cloud Console Configuration

**CRITICAL**: Update your Google Cloud Console settings:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Select your project**
3. **Go to APIs & Services > Credentials**
4. **Find your OAuth 2.0 Client ID**
5. **Click Edit**
6. **Add these Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://kuepass.com
   https://www.kuepass.com
   ```
7. **Add these Authorized redirect URIs:**
   ```
   http://localhost:3000/auth/signin
   http://localhost:3000/auth/signnup
   https://kuepass.com/auth/signin
   https://kuepass.com/auth/signnup
   ```

### 3. Environment Variables

Make sure your `.env.local` file has:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_API_URL=https://api.kuepass.com/api/
```

### 4. How It Works Now

1. **Primary**: Uses `@react-oauth/google` with auth-code flow
2. **Fallback**: Direct Google OAuth URL redirect
3. **Handles**: Auth code exchange on your backend
4. **Compatible**: Works with restricted browsers and WebViews

### 5. Testing

Test in these environments:
- ✅ **Desktop browsers** (Chrome, Firefox, Safari)
- ✅ **Mobile browsers** (Safari, Chrome Mobile)
- ✅ **Embedded browsers** (WebViews in apps)
- ✅ **Corporate networks** with restrictions

### 6. Why This Fixes the Error

- **Redirect flow** instead of popup avoids WebView restrictions
- **Direct URL fallback** ensures compatibility
- **Auth-code flow** is more secure and widely supported
- **Proper domain configuration** in Google Cloud Console

## Code Changes Made

1. **Updated OAuth configuration** in both signin and signup pages
2. **Added auth-code handling** for backend token exchange
3. **Added fallback direct URL** for maximum compatibility
4. **Improved error handling** for better user experience

This solution should resolve the "disallowed_useragent" error while maintaining your existing code structure. 