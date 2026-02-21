import jwt from 'jsonwebtoken';

let demoUsers = []; // In-memory storage for demo

export default function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { googleId, username, email, photoURL } = req.body;
    if (!googleId || !username) return res.status(400).json({ error: "Missing fields" });

    let user = demoUsers.find(u => u.id === googleId);
    if (!user) {
      user = { id: googleId, username, email, photoURL, following: [] };
      demoUsers.push(user);
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'demo_secret', { expiresIn: '7d' });

    res.status(200).json({ token, user });
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}