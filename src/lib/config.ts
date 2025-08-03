// Environment configuration helper
export const config = {
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  backendUrl: import.meta.env.VITE_BACKEND_URL,
};

export const validateEnvironment = () => {
  const requiredVars = [
    { key: 'VITE_GEMINI_API_KEY', value: config.geminiApiKey, description: 'Gemini API key for AI chatbot' },
  ];

  const missingVars = requiredVars.filter(variable => !variable.value);

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:');
    missingVars.forEach(variable => {
      console.error(`- ${variable.key}: ${variable.description}`);
    });
    console.error('Please check your .env file and make sure all required variables are set.');
    return false;
  }

  return true;
};

export default config;
