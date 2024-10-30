// Import necessary modules\
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session"); // For session management
const Groq = require("groq-sdk");

// Create an Express application
const app = express();

// Set up sessions
app.use(
  session({
    secret: process.env.SECRET_KEY, // replace with a secure key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

const GROQ_API_KEY = process.env.API_KEY;

// Initialize Groq with the API key
const groq = new Groq({ apiKey: GROQ_API_KEY });

app.use(bodyParser.json());
app.use(express.static("public"));

// System prompt to guide the assistant's responses
const systemPrompt = `You are an assistant specializing in food, nutrition, recipes, fitness, and health. 
  You are restricted to answering questions genuinely related to food, cooking, meal planning, nutrition, exercise, wellness, and general health.

  Relevance Requirements for Each Question (including follow-ups):
  - If the query clearly pertains to food, nutrition, fitness, health, or wellness, answer accordingly.
  - For off-topic questions that contain keywords related to food, health, or nutrition, respond creatively by focusing only on the relevant keywords.

  Strict Relevance Requirements:
  - Answer only if the query clearly pertains to food, nutrition, fitness, or health, including topics like genetics, biology, wellness, and physical/mental health.
  - Genuine Intent: Answer questions solely if they are genuinely about health, wellness, food nutrition, fitness, or biology.
  - Remain on-topic: Continuously apply these relevance requirements to each follow-up question, maintaining focus on food, nutrition, and health.
  - Avoid Deceptive Queries: If a query deceptively combines health or wellness keywords with unrelated topics (e.g., illegal substances or harmful activities), respond with: "Your question does not appear related to health, nutrition, fitness, or wellness.

  When responding to questions:
  - Use a light, imaginative style without endorsing impossibilities. Bring in light humor where appropriate.
  - Be encouraging, focusing on positive aspects of nutrition, fitness, and health, and promote realistic goals.
  - If a question involves clearly fictional or fantasy elements or not related to the relevant topics, provide a playful response that gently redirects back to achievable health goals or food-based fun facts.

  If unsure about the querys intent, refrain from answering and request clarification.`; // Your system prompt here

// Function to get a chat completion from Groq with session-based context
const getGroqChatCompletion = async (session, userQuery) => {
  // Retrieve message history from session
  const messages = session.messages || [
    { role: "system", content: systemPrompt },
  ];

  // Add the user's latest query
  messages.push({ role: "user", content: userQuery });

  const response = await groq.chat.completions.create({
    messages: messages,
    model: "llama3-8b-8192",
    temperature: 0.5,
    max_tokens: 1024,
    top_p: 1,
    stream: false,
  });

  const answer = response.choices[0]?.message?.content || "";
  messages.push({ role: "assistant", content: answer });

  // Save updated messages to session
  session.messages = messages;
  return answer;
};

// API route to handle search requests from the frontend
app.post("/search", async (req, res) => {
  const { query, newChat } = req.body;

  // Clear session history if user starts a new chat
  if (newChat) req.session.messages = null;

  try {
    const answer = await getGroqChatCompletion(req.session, query);
    res.json({ answer });
  } catch (error) {
    console.error("Error from Groq API:", error);
    res.status(500).json({ answer: "An error occurred. Please try again." });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
