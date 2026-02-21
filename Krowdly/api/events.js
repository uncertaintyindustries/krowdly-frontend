import jwt from 'jsonwebtoken';

let demoEvents = []; // In-memory storage

export default function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Simple JWT auth for POST
  let currentUser = null;
  if (req.headers.authorization) {
    try {
      const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET || 'demo_secret');
      currentUser = decoded.id;
    } catch (err) {}
  }

  if (req.method === 'POST') {
    if (!currentUser) return res.status(401).json({ error: "Unauthorized" });
    const { name, location, category, privacy, lat, lon } = req.body;
    if (!name || !lat || !lon) return res.status(400).json({ error: "Missing fields" });

    const event = {
      _id: Math.random().toString(36),
      name,
      location,
      category,
      privacy,
      lat,
      lon,
      creator: { username: "Demo User", photoURL: "https://picsum.photos/50", _id: currentUser }
    };

    demoEvents.unshift(event);
    res.status(200).json(event);

  } else if (req.method === 'GET') {
    res.status(200).json(demoEvents);
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}