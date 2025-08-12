
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { config, validateEnvironment } from '../lib/config';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const Chatbot = () => {
  // State to store chat messages
  const [messages, setMessages] = useState<Message[]>([]);
  // State to store the current input message
  const [inputMessage, setInputMessage] = useState('');
  // State to manage loading indicator during API calls (for disabling input/button)
  const [isLoading, setIsLoading] = useState(false);
  // State to manage the bot's typing animation
  const [isBotTyping, setIsBotTyping] = useState(false);
  // State to control the visibility of the chat window
  const [isChatOpen, setIsChatOpen] = useState(false);
  // State to control the visibility of the "How can I assist you today?" floating message
  const [showFloatingMessage, setShowFloatingMessage] = useState(false);

  // Ref for scrolling to the latest message
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Ref for the input field to focus it
  const inputRef = useRef<HTMLInputElement>(null);

  // Define the system context for the LLM based on your website content
  const smartSchedulingContext = `
        You are an AI chatbot for "WorkCurb," a workforce and shift scheduling web application.
        Your purpose is to answer questions ONLY based on the following information about WorkCurb.
        If a user asks about anything not covered by this information, politely state that you can only answer questions related to WorkCurb.

        --- WorkCurb Website Information ---

        What is WorkCurb?
        WorkCurb is an advanced workforce and shift scheduling web application designed to streamline employee scheduling, automate attendance tracking, manage leave requests, and ensure labor law compliance—all within a single platform. Shifts are automatically generated based on predefined constraints using Google OR-Tools. The system uses powerful algorithms to generate optimal shift schedules, considering multiple constraints like employee preferences, legal limits, past workloads, and organizational staffing needs.
        This solution is built for modern businesses that aim to reduce manual planning, increase employee satisfaction, and boost overall efficiency through intelligent automation.

        Why Use WorkCurb?
        In many companies, scheduling employees can be time-consuming, error-prone, and inefficient when done manually or with spreadsheets. Issues like understaffing, overworking, and shift conflicts can lead to:
        - Decreased productivity
        - Legal penalties due to labor law violations
        - Increased employee dissatisfaction
        - Loss of revenue due to operational chaos
        WorkCurb eliminates these issues to automate and optimize the entire process. It ensures fair, conflict-free, and efficient shift allocations with minimal human intervention. The result is:
        - Better compliance with work-hour regulations
        - Improved workforce productivity
        - Happier, more balanced employees
        - Cost savings for employers

        Who Uses WorkCurb?
        WorkCurb is perfect for remote teams and distributed organizations that need to coordinate across time zones, roles, and flexible work arrangements. Ideal for:
        🌍 Remote-First Companies – Schedule distributed teams across different regions
        🖥 IT & Tech Teams – Manage on-call shifts, DevOps, and global support schedules
        💻 Freelancers & Agencies – Balance client work with flexible project-based scheduling
        🚀 Startups & Hybrid Workplaces – Seamlessly blend in-office and remote shifts

        Key Features of WorkCurb
        Here's what sets WorkCurb apart:
🔄 1. Automated Shift Generation
Avoids back-to-back shifts and ensures fair distribution
Optimizes based on employee availability and workload balance

🔐 2. Role-Based Access
Two user roles: Admin and Employee
👨‍💼 Admins manage shifts, attendance, leave requests, and generate reports
👷 Employees view schedules, apply for leave, and track attendance

⚖️ 3. Legal Compliance
Configure rules like maximum weekly hours, minimum rest periods, and mandatory breaks
🛡 Prevents accidental violations of labor laws and ensures compliance

📊 4. Personalized Dashboards with Visual Insights
Tailored dashboards for both Admins and Employees
📈 Visual insights include:
Attendance summaries
Performance charts
Leave statistics for smarter decisions

🔁 5. Real-Time Dashboard Synchronization
The app keeps Admin/HR and Employee dashboards synchronized automatically
🕒 Any updates to shifts, attendance, or leave status are reflected in real-time
🤝 Enables transparency, efficient communication, and better coordination

        Pricing Plans
        Starter
Price: NPR 2,999/month
Ideal For: Small teams getting started
Includes:
Up to 50 employees
Basic scheduling
Time tracking
Basic reports
Email support

🔹 Professional (Most Popular)
Price: NPR 9,999/month
Ideal For: Growing businesses
Includes:
Up to 500 employees
Advanced scheduling
Time tracking & overtime
Advanced analytics
Priority support
API access
Custom integrations

🔹 Enterprise
Price: NPR 19,999/month
Ideal For: Large organizations
Includes:
Unlimited employees
Full feature access
Advanced security
Custom workflows
Dedicated support
On-premise option
Training & onboarding

        Contact & Support
        We're here to help! Whether you're a new user or an existing customer needing assistance, feel free to reach out anytime:
        - 📧 Email: info.workcurb@gmail.com
        - 📱 Phone/WhatsApp: +977-9869112525
        - 🕘 Support Hours: 9 AM – 7 PM (NPT), Monday to Saturday
        - 📍 Location: IIMS Dhobidhara, Kathmandu

  How to Use the App (Quick Start Guide)
 First, Purchase a Plan: Select and purchase the plan that best fits your needs directly from the website.
Check Your Email: After payment, you'll receive a Gmail and password in your verified email inbox.
Log In to the HR Portal: Use the provided Gmail and password to log in and access the full HR dashboard.
Add Employees: Enter employee details such as name, ID, department, and preferred shift time.
Set Shift Rules: Define shift rules including minimum rest hours, maximum weekly hours, and required breaks.
Generate AI Schedule: Click "Generate Schedule" to let the AI create optimized shift plans automatically.
View and Edit Shifts: Review the generated shifts and make manual adjustments if necessary.
Assign Courses: Assign training or development courses to employees to enhance performance.
Track Attendance: Employees can log attendance through their dashboard, while Admins can monitor it in real time.
Manage Leave Requests: Employees submit leave requests; Admins can approve or reject them with a click.
Access Calendar & Events: Stay updated with upcoming shifts, holidays, training sessions, and important events.
        --- End of WorkCurb Website Information ---
Response Rules:
1. First check if the user's query contains any of these keywords (including common misspellings):
   - Pricing related: "price", "pricing", "cost", "prixe", "prie", "prce"
   - Features: "feature", "function", "tool", "feture", "funtion"
   - Plans: "plan", "package", "subscription", "pln", "pakage"
   - Contact: "contact", "support", "help", "contct", "suport"
   - Usage: "how to use", "guide", "tutorial", "how use", "gide"

2. If you detect a likely typo (like "prixe" instead of "price" and other term):Check if any word in their query is a likely typo of correct terms
      - Compare using phonetic similarity (e.g., "orixe" → "price")
      - Account for: missing letters, swapped letters, phonetic misspellings
   - First ask: "Did you mean [corrected term]?"
   - If user responds "yes" or confirms, provide the answer for the corrected term
   - If user says "no", ask them to rephrase

3. For correctly spelled terms:
   - Provide direct answers from the information
        Based on the above information, respond to the user's questions. 
- Use bullet points or numbered lists for responses about features, pricing, benefits, or steps.
- Avoid long paragraphs.if they write the correct name like price give the ans for that but if the user ask prixe instead of price ask user do you mean price and for other if the user type yes then give that ans of related term 
- Keep responses clear, concise, and easy to scan.
- If a question cannot be answered from the provided information, politely say that you can only answer questions about WorkCurb.
    `;

  // Effect to validate environment variables on component mount
  useEffect(() => {
    if (!validateEnvironment()) {
      console.warn('AI Chatbot may not work properly due to missing environment variables.');
    }
  }, []);

  // Effect to scroll to the bottom of the chat window when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen, isBotTyping]); // Also re-scroll if chat opens or bot starts typing

  // Effect to show and hide the floating welcome message
  useEffect(() => {
    if (!isChatOpen) {
      setShowFloatingMessage(true);
      const timer = setTimeout(() => {
        setShowFloatingMessage(false);
      }, 5000); // Hide after 5 seconds
      return () => clearTimeout(timer);
    } else {
      setShowFloatingMessage(false); // Hide if chat is open
    }
  }, [isChatOpen]);

  // Effect to focus input field when chat opens or when bot finishes typing
  useEffect(() => {
    if (isChatOpen && !isBotTyping && !isLoading) {
      inputRef.current?.focus();
    }
  }, [isChatOpen, isBotTyping, isLoading]);

  /**
   * Handles sending a message to the LLM.
   * @param {string} message The message to send.
   */
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return; // Don't send empty messages

      // Add user message to chat history
      const newUserMessage: Message = { sender: "user", text: message };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setInputMessage(""); // Clear input field

      setIsLoading(true); // Disable input and button
      setIsBotTyping(true); // Show bot typing animation

      try {
        // Prepare chat history including the system context
        let chatHistory = [
          {
            role: "user",
            parts: [{ text: smartSchedulingContext }],
          },
        ];

        // Add previous messages to history for context
        messages.forEach((msg) => {
          chatHistory.push({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.text }],
          });
        });

        // Add the current user message
        chatHistory.push({ role: "user", parts: [{ text: message }] });

        const payload = {
          contents: chatHistory,
          generationConfig: {
            temperature: 0.2, // Lower temperature for more factual, less creative responses
            topP: 0.9,
            topK: 40,
          },
        };

        const apiKey = config.geminiApiKey;
        
        if (!apiKey) {
          throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
        }
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `API error: ${response.status} - ${
              errorData.error.message || response.statusText
            }`
          );
        }

        const result = await response.json();

        if (
          result.candidates &&
          result.candidates.length > 0 &&
          result.candidates[0].content &&
          result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0
        ) {
          const llmResponseText = result.candidates[0].content.parts[0].text;
          // Add LLM response to chat history
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "bot", text: llmResponseText },
          ]);
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              sender: "bot",
              text: "Sorry, I could not generate a response. Please try asking in a different way or check the provided information.",
            },
          ]);
          console.error("Unexpected LLM response structure:", result);
        }
      } catch (error) {
        console.error("Error calling Gemini API:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.` },
        ]);
      } finally {
        setIsLoading(false); // Hide loading indicator and re-enable input/button
        setIsBotTyping(false); // Hide bot typing animation
      }
    },
    [messages, smartSchedulingContext]
  ); // Depend on messages and context for accurate chat history

  /**
   * Handles the form submission (when user presses Enter or clicks Send)
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  return (
    <div className="font-inter antialiased">
      {/* Chatbot Toggle Button (Floating Robot Icon) */}
      <button
        onClick={() => {
          setIsChatOpen(!isChatOpen);
          // Focus input when chat opens
          if (!isChatOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        }}
        className="fixed bottom-6 right-6 z-50 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition duration-300 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
        aria-label="Toggle Chatbot"
      >
        {/* Simple Robot Icon using SVG */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-bot"
        >
          <path d="M12 8V4H8" />
          <path d="M2 14v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2" />
          <path d="M8 12h8" />
          <path d="M2 14h20" />
          <path d="M12 2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
        </svg>
      </button>

      {/* Floating "How can I assist you today?" message */}
      {showFloatingMessage && !isChatOpen && (
        <div className="fixed bottom-24 right-6 z-40 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-xl opacity-0 animate-fadeInOut pointer-events-none">
          How can I assist you today?
        </div>
      )}

      {/* Chat Window */}
      {isChatOpen && (
        <>
          <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border z-50 flex flex-col overflow-hidden border-gray-200">
            {/* Header */}
            <header className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white flex justify-between items-center rounded-t-lg">
              <h2 className="text-xl font-bold">WorkCurb Assistant</h2>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white hover:text-gray-200 focus:outline-none"
                aria-label="Close Chat"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </header>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-10">
                  {config.geminiApiKey ? (
                    <p className="text-base">
                      Hello! How can I help you with WorkCurb?
                    </p>
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-sm text-red-600 mb-2">
                        ⚠️ AI Chatbot not configured
                      </p>
                      <p className="text-xs text-gray-500">
                        Please set up your Gemini API key in the environment variables to use the AI chatbot.
                      </p>
                    </div>
                  )}
                </div>
              )}
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-lg shadow-md ${
                      msg.sender === "user"
                        ? "bg-green-500 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <div
                      className="break-words"
                      dangerouslySetInnerHTML={{
                        __html: msg.text
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold
                          .replace(/\n\s*[-*]\s+/g, "<br>• ") // bullet points
                          .replace(/\n/g, "<br>"), // line breaks
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              {isBotTyping && ( // Show typing animation only when bot is typing
                <div className="flex justify-start">
                  <div className="max-w-[75%] p-3 rounded-lg shadow-md bg-gray-100 text-gray-800 rounded-bl-none">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} /> {/* Element to scroll to */}
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSubmit}
              className="p-4 bg-white border-t border-gray-200 flex items-center space-x-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                disabled={isLoading || !config.geminiApiKey} // Disable input when loading or API key missing
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !config.geminiApiKey} // Disable button when loading or API key missing
              >
                {isLoading ? ( // Show spinner on button when any loading is happening
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Send"
                )}
              </button>
            </form>
          </div>

          {/* Custom Styles for animations */}
          <style>{`
            @keyframes fadeInOut {
              0% {
                opacity: 0;
                transform: translateY(10px);
              }
              10% {
                opacity: 1;
                transform: translateY(0px);
              }
              90% {
                opacity: 1;
                transform: translateY(0px);
              }
              100% {
                opacity: 0;
                transform: translateY(10px);
              }
            }

            .animate-fadeInOut {
              animation: fadeInOut 5s ease-in-out forwards;
            }
          `}</style>
        </>
      )}
    </div>
  );
};

export default Chatbot;
