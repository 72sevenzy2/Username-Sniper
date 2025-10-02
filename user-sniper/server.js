// server.js
import express from "express";
import fetch from "node-fetch";

const app = express();

app.use(express.static("public"));

app.get("/check", async (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.status(400).json({ error: "Missing username" });
  }

  try {
    // api endpoint for roblox
    const response = await fetch(
      `https://auth.roblox.com/v1/usernames/validate?request.username=${username}&request.birthday=2000-01-01&request.context=Signup`
    );

    const data = await response.json();

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));