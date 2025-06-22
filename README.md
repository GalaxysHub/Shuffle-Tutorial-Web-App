# Shuffle Dance Academy

A comprehensive React application for learning shuffle dance with subscription-based premium content and individual class purchases.

## Features

- **Free Tutorials**: Access basic shuffle dance tutorials without registration
- **Premium Subscription**: Monthly subscription for advanced content and exclusive choreographies
- **Individual Classes**: One-time purchase for specialized workshops and masterclasses
- **User Authentication**: Firebase Authentication with secure user management
- **Payment Processing**: Stripe integration for subscriptions and one-time purchases
- **Responsive Design**: Material-UI components with custom theming
- **State Management**: Redux Toolkit for centralized application state

## Technology Stack

- **Frontend**: React 18 with Vite
- **State Management**: Redux Toolkit
- **UI Framework**: Material-UI (MUI)
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Payments**: Stripe
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Firebase project with Authentication and Firestore enabled
- Stripe account (test mode for development)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd shuffle-dance-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   **Firebase Configuration**: The Firebase configuration is already set up for the `shuffle-tut` project. If you need to use a different Firebase project, update the configuration in `src/services/firebase.js`.
   
   **Current Firebase Project**: shuffle-tut
   - Project ID: shuffle-tut
   - Auth Domain: shuffle-tut.firebaseapp.com
   
   **Environment Variables**: Already configured with your Stripe test key.
   - ✅ Firebase: Configured for shuffle-tut project
   - ✅ Stripe: Configured with test key (pk_test_51RcwCB...)

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Auth/            # Authentication components
│   ├── Content/         # Content-related components
│   └── Layout/          # Layout components
├── pages/               # Page components
├── store/               # Redux store and slices
├── services/            # External service configurations
├── hooks/               # Custom React hooks
├── theme/               # MUI theme configuration
└── utils/               # Utility functions
```

## Key Components

### Authentication Flow
- User registration and login with Firebase Auth (Email/Password + Google OAuth)
- Google Sign-In with profile picture and display name support
- Automatic session persistence
- Protected routes for premium content
- User profile management with social login integration

### Content Management
- Three tiers of content: Free, Premium (subscription), Individual Purchase
- Dynamic access control based on user subscription status
- Video player with access restrictions

### Payment Integration
- Stripe Checkout for subscriptions and one-time purchases
- Webhook handling for payment confirmation (requires backend)
- User purchase history tracking

## Backend Implementation

✅ **Complete backend implemented** using Firebase Cloud Functions:

- **Payment Processing**: Stripe integration for subscriptions and one-time purchases
- **Webhook Handling**: Automatic user data updates on successful payments
- **Customer Portal**: Subscription management through Stripe Customer Portal
- **Security**: Authenticated API calls and webhook signature verification

### Quick Start:
1. **Deploy Functions**: See `DEPLOYMENT_GUIDE.md` for detailed setup
2. **Configure Stripe**: Set up products, prices, and webhooks
3. **Test Payments**: Use Stripe test cards to verify the flow

### Backend Features:
- Subscription checkout sessions
- Individual class purchase sessions
- Stripe webhook processing
- User subscription info retrieval
- Customer portal access

## Firestore Security Rules

The application includes comprehensive security rules in `firestore.rules`:

- Users can only access their own data
- Content access is controlled by subscription status and purchases
- Server-side operations are protected from client manipulation

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (if configured)

### Environment Setup

1. **Firebase Configuration**:
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Configure authentication providers:
     - ✅ Email/Password (enabled)
     - ✅ Google (enabled with OAuth setup)
   - Deploy Firestore security rules

2. **Stripe Configuration**:
   - Create products and prices in Stripe Dashboard
   - Set up webhook endpoints
   - Configure test mode for development

## Deployment

1. **Frontend**: Deploy to your preferred hosting service:
   ```bash
   npm run build
   # Then deploy the 'dist' folder to: Vercel, Netlify, GitHub Pages, etc.
   ```

2. **Backend**: Deploy Firebase Cloud Functions:
   ```bash
   npm run deploy-functions  # After configuring Stripe keys
   ```

3. **Database**: Deploy Firestore rules:
   ```bash
   npm run deploy-rules
   ```

## Security Considerations

- All sensitive operations are server-side only
- Client-side code cannot directly modify subscription status or purchases
- Firestore security rules enforce access control
- Stripe webhooks verify payment authenticity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open a GitHub issue or contact the development team.

---

**Note**: This is a complete full-stack application requiring both frontend and backend components. The backend implementation (Firebase Cloud Functions) is essential for payment processing and user access control.