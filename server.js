import { config } from "dotenv";

config();

import express, { json } from "express";
import { connect, Schema, model } from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(json());

console.log(process.env.MONGODB_URI);
connect(process.env.MONGODB_URI, {
  useNewUrlParser:true
})
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));
  let users = [];
const UserSchema = new Schema({
  id: Number,
  licence: String,
  fname: String,
  mobile: Number,
  status: String,
});

const User = model("User", UserSchema);

app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post("/users", async (req, res) => {
  const newUser = new User(req.body);
  await newUser.save();
  res.json({ message: "User Added", user: newUser });
});

app.put("/users/:id", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "User Updated" });
});

app.delete("/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User Deleted" });
});


app.post('/register', (req, res) => {
  const { username, password, confirmpass, checkbox } = req.body;

  if (!username || !password || !confirmpass) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  if (checkbox !== true) {
    return res.status(400).json({ success: false, message: 'You must accept the terms.' });
  }

  if (password !== confirmpass) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }

  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Username already exists.' });
  }

  const newUser = { username, password };
  users.push(newUser);

  return res.status(201).json({
    success: true,
    message: 'Registration successful!',
    user: { username: newUser.username }
  });
});


app.post('/login', (req, res) => {
  const { username, password, checkbox } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  if (checkbox !== true) {
    return res.status(400).json({ success: false, message: 'Please accept the terms.' });
  }

  const user = users.find(user => user.username === username);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (user.password !== password) {
    return res.status(400).json({ success: false, message: 'Incorrect password.' });
  }

  return res.json({
    success: true,
    message: 'Login successful!',
    user: { username: user.username }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
