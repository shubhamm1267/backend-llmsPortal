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
  username:String,
  role:String
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

const AuthUserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

const AuthUser = model("AuthUser", AuthUserSchema);

app.post('/auth/register', async (req, res) => {
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
  
  try {
    const existingUser = await AuthUser.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already exists.' });
    }
    
    const newUser = new AuthUser({ username, password });
    await newUser.save();
    
    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: { username: newUser.username }
    });
  } catch (err) {
    console.log("Registration error:", err);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

app.get('/auth/userCounts', async (req, res) => {
  try {
    const totalUsers = await AuthUser.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayCount = await AuthUser.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    return res.json({ success: true, totalUsers, todayCount });
  } catch (err) {
    console.error("Error counting users:", err);
    return res.status(500).json({ success: false, message: 'Server error while counting users.' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { username, password, checkbox } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }
  if (checkbox !== true) {
    return res.status(400).json({ success: false, message: 'Please accept the terms.' });
  }
  
  try {
    const user = await AuthUser.findOne({ username });
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
  } catch (err) {
    console.log("Login error:", err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

app.get('/auth/user/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await AuthUser.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({
      success: true,
      user: { username: user.username }
    });
  } catch (err) {
    console.log("Get user error:", err);
    return res.status(500).json({ success: false, message: 'Server error retrieving user details.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
