import jwt from 'jsonwebtoken';

export default function handler(req,res){
  if(req.method==="POST"){
    const { googleId, username, email, photoURL } = req.body;
    const user = { id: googleId, username, email, photoURL, following: [] };
    const token = jwt.sign({ id:user.id }, 'YOUR_JWT_SECRET');
    res.status(200).json({ token, user });
  } else {
    res.status(405).end();
  }
}