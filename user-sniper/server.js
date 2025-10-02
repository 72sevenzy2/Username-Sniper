// server.js
import express from "express";
import fetch from "node-fetch"; // install with: npm install node-fetch

const app = express();

// Serve frontend files from "public" folder
app.use(express.static("public"));

// Endpoint to check Roblox username availability
app.get("/check", async (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.status(400).json({ error: "Missing username" });
  }

  try {
    // Roblox API endpoint
    const response = await fetch(
      `https://auth.roblox.com/v1/usernames/validate?request.username=${username}&request.birthday=2000-01-01&request.context=Signup`
    );

    const data = await response.json();

    // Roblox returns a field 'code' — if 0, it's available
    if (data.code === 0) {
      res.json({ taken: false, message: "Available!" });
    } else {
      res.json({ taken: true, message: data.message });
    }
  } catch (err) {
    console.error("Error fetching Roblox API:", err);
    res.status(500).json({ error: "Failed to check username" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
