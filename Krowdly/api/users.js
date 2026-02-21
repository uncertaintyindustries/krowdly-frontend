let users=[{id:"demo",username:"Demo User",photoURL:"https://picsum.photos/50",following:[]}];
export default function handler(req,res){
  res.status(200).json(users);
}