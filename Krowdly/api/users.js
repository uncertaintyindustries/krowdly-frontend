let demoUsers = [
  { id: "demo", username: "Demo User", photoURL: "https://picsum.photos/50", following: [] }
];

export default function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    res.status(200).json(demoUsers);
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}