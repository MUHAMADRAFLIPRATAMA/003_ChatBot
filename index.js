const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect("/index.html");
});

app.post("/api/chat", async (req, res) => {
  try {
    const messages = req.body.messages;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: "Messages harus berupa array",
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
        },

        body: JSON.stringify({
          model: "gemini",
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048,
          reasoning_effort: "low",
          stream: true,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.text();

      console.error("Gemini Error:", errorData);

      return res.status(response.status).json({
        error: errorData,
      });
    }

    // Header untuk streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

   