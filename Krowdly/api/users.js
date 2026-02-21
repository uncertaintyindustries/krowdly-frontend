// Demo users endpoint
let users = [{ _id: "demo", username: "Demo User", following: [] }];

export default function handler(req, res) {
  const path = req.url.split("/").filter(Boolean);

  if (req.method === "GET") {
    res.status(200).json(users);

  } else if (req.method === "POST" && path[1] && path[2]) {
    const user = users.find(u => u._id === path[1]);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (path[2] === "follow") user.following.push("demo");
    if (path[2] === "unfollow") user.following = user.following.filter(f => f !== "demo");

    res.status(200).json({ message: path[2] + " success" });
  } else {
    res.status(405).end();
  }
}