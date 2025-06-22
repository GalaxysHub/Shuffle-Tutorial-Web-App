# Google OAuth Setup for Shuffle Dance Academy

This guide walks you through setting up Google Sign-In for your Firebase project.

## Firebase Console Setup

### 1. Enable Google Authentication

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your `shuffle-tut` project
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google** in the providers list
5. Toggle **Enable** to turn it on
6. Configure the settings:
   - **Project support email**: Use your email address
   - **Project public-facing name**: "Shuffle Dance Academy"
   - Click **Save**

### 2. Configure OAuth Consent Screen (Google Cloud Console)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the same project as your Firebase project
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Choose **External** user type (unless you have a Google Workspace domain)
5. Fill out the required information:
   - **App name**: Shuffle Dance Academy
   - **User support email**: Your email
   - **App logo**: (Optional) Upload a logo
   - **Developer contact information**: Your email
6. Click **Save and Continue**

### 3. Configure OAuth Scopes

1. On the **Scopes** tab, click **Add or Remove Scopes**
2. Add these scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
3. Click **Update** then **Save and Continue**

### 4. Add Test Users (Development)

1. On the **Test users** tab, click **Add Users**
2. Add email addresses that you want to test with during development
3. Click **Save and Continue**

### 5. Configure Authorized Domains

1. Back in Firebase Console → **Authentication** → **Settings** tab
2. Scroll down to **Authorized domains**
3. Add your domains:
   - `localhost` (for development)
   - Your production domain (e.g., `yourdomain.com`)

## Domain Configuration for Production

When deploying to production, you'll need to:

1. **Add your production domain** to Firebase authorized domains
2. **Update OAuth consent screen** with your production domain
3. **Configure redirect URLs** in Google Cloud Console if needed

## Testing the Integration

### Development Testing

1. Start your development server: `npm run dev`
2. Navigate to the login or register page
3. Click "Continue with Google" or "Sign up with Google"
4. You should see the Google OAuth consent screen
5. Sign in with a test user account

### What Happens During Sign-In

1. User clicks Google sign-in button
2. Google OAuth popup opens
3. User grants permissions
4. App receives user profile information:
   - Email address
   - Display name
   - Profile picture URL
5. User document is created/updated in Firestore
6. User is logged into the app

## Troubleshooting

### Common Issues

1. **"Error 403: access_denied"**
   - Make sure the user is added to test users
   - Check that the OAuth consent screen is properly configured

2. **"Error 400: redirect_uri_mismatch"**
   - Verify authorized domains are configured correctly
   - Check that localhost is in the authorized domains list

3. **"This app isn't verified"**
   - Normal for development - click "Advanced" → "Go to Shuffle Dance Academy (unsafe)"
   - For production, you'll need to verify your app with Google

4. **Pop-up blocked**
   - Enable pop-ups for your domain
   - Some browsers block OAuth popups by default

### Debugging Steps

1. **Check browser console** for error messages
2. **Verify Firebase config** in `src/services/firebase.js`
3. **Check network tab** to see if OAuth requests are being made
4. **Test with different browsers** to rule out browser-specific issues

## Security Considerations

- Google OAuth automatically validates email addresses
- Profile pictures are served from Google's CDN
- User data is stored securely in Firestore
- OAuth tokens are managed by Firebase Auth
- No sensitive data is stored in localStorage

## Production Checklist

- [ ] OAuth consent screen configured
- [ ] Production domain added to authorized domains
- [ ] App verification submitted to Google (if required)
- [ ] Privacy policy and terms of service links added
- [ ] HTTPS enabled for production domain
- [ ] Firebase project upgraded to paid plan (if needed for production usage)

## Support

If you encounter issues:
1. Check the [Firebase Auth documentation](https://firebase.google.com/docs/auth/web/google-signin)
2. Review [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2)
3. Check Firebase project logs in the Console