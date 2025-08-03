#!/bin/bash

# WorkCurb Development Setup Script

echo "🚀 Setting up WorkCurb development environment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  IMPORTANT: Please edit your .env file and add your actual API keys:"
    echo "   - VITE_GEMINI_API_KEY: Get from https://makersuite.google.com/app/apikey"
    echo "   - Other keys as needed for your setup"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit your .env file with actual API keys"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Check the console for any missing environment variable warnings"
echo ""
echo "For detailed setup instructions, see ENVIRONMENT_SETUP.md"
