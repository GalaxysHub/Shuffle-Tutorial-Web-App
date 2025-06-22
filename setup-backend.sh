#!/bin/bash

# Setup script for Shuffle Dance Academy Backend
echo "🚀 Setting up Shuffle Dance Academy Backend..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if needed)
echo "🔐 Checking Firebase authentication..."
firebase projects:list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Please log in to Firebase:"
    firebase login
fi

# Set project
echo "📁 Setting Firebase project to shuffle-tut..."
firebase use shuffle-tut

# Install function dependencies
echo "📦 Installing function dependencies..."
cd functions
npm install
cd ..

# Prompt for Stripe keys
echo ""
echo "🔑 Please enter your Stripe keys:"
echo "You can find these in your Stripe Dashboard → Developers → API keys"
echo ""

read -p "Enter your Stripe SECRET key (sk_test_...): " STRIPE_SECRET_KEY
read -p "Enter your app URL (or press Enter for localhost:5174): " APP_URL

# Set default URL if empty
if [ -z "$APP_URL" ]; then
    APP_URL="http://localhost:5174"
fi

# Configure Firebase functions
echo "⚙️  Configuring Firebase Functions..."
firebase functions:config:set stripe.secret_key="$STRIPE_SECRET_KEY"
firebase functions:config:set app.url="$APP_URL"

echo ""
echo "✅ Basic setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create products in Stripe Dashboard"
echo "2. Deploy functions: firebase deploy --only functions"
echo "3. Set up webhooks in Stripe (see DEPLOYMENT_GUIDE.md)"
echo "4. Test with your React app: npm run dev"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"