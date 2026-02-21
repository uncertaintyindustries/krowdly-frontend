let events = [];

export default function handler(req, res) {
  if (req.method === "POST") {
    const { name, location, category, privacy, lat, lon } = req.body;
    const event = {
      _id: Math.random().toString(36),
      name,
      location,
      category,
      privacy,
      lat,
      lon,
      creator: { username: "Demo User", photoURL: "https://picsum.photos/50", _id: "demo" }
    };
    events.unshift(event);
    res.status(200).json(event);
  } else if (req.method === "GET") {
    res.status(200).json(events);
  } else {
    res.status(405).end();
  }
}