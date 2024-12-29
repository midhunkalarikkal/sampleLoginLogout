var express = require("express");
var router = express.Router();
const User = require("../models/users");
const Logins = require('../models/logins');
const bcrypt = require('bcrypt');
const { langs, cards } = require("../data");

// Middleware to check session
function checkLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/");
  }
  next();
}

// Prevent caching for all routes
router.use((req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// Redirect logged-in users from login page to home
router.get("/", (req, res) => {
  try{
    if (req.session.user) {
      return res.redirect("/home");
    }
    return res.render("index");
  }catch(err){
    return res.render('error', { message: "Something went wrong", error: { status: 404 } });
  }
});

router.get('/signup',(req,res) => {
  try{
    return res.render("signup");
  }catch(err){
    return res.render('error', { message: "Something went wrong", error: { status: 404 } });
  }
})

// Login route
router.post("/login", async(req, res) => {
  try {
    console.log("login")
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password",
      });
    }

    const user = await Logins.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    req.session.user = {email : user.email, name : user.name};

    return res.json({
      success: true,
      message: "Login successful! Redirecting...",
      redirectUrl: "/home",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
});


// Sign up route
router.post('/signup', async(req,res) => {
  try{

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill out all fields!' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new Logins({ name, email, password: hashedPassword });
    await user.save();

    return res.json({
      success: true,
      message: 'Signup successful! Redirecting...',
      redirectUrl: '/',
    });

  }catch(err){
    res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
})

// Home route (requires login)
router.get("/home", checkLogin, async (req, res) => {
  try {
    const userList = await User.find();
    const name = req.session.user.name;
    return res.render("home", { name, cards, langs, userList });
  } catch (err) {
    return res.render('error', { message: "Something went wrong", error: { status: 404 } });
  }
});

// Insert user into databse route
router.post("/add", async (req, res) => {
  try {

    console.log(req.body);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    });

    await user.save();

    return res.json({
      type: "success",
      message: "User added successfully!",
    });
  } catch (err) {
    return res.json({
      type: "error",
      message: "Server error. Please try again.",
    });
  }
});

// Get user data for editing (returns JSON)
router.get("/edit/:id", async (req, res) => {
  try {
    const id = req.params.id;  
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        type: "danger",
        message: "User not found",
      });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
  } catch (err) {
    return res.status(500).json({
      type: "danger",
      message: "Server error, please try again later",
    });
  }
});

// Update user data
router.post("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.json({
        type: "danger",
        message: "User not found",
      });
    }

    const savedUser = await User.findByIdAndUpdate(id, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    });

    if(savedUser){
      return res.json({
        type: "success",
        message: "User updated successfully",
      });
    }else{
      return res.json({
        type: "success",
        message: "User updating error, please try again.",
      });
    }

  } catch (err) {
    console.error(err);
    return res.json({
      type: "danger",
      message: "Server error, please try again",
    });
  }
});


// Delete an user from the index page
router.get("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);
    if (!user) {
      return res.json({
        type: "danger",
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(id);

    return res.json({
      type: "success",
      message: "User deleted successfully",
    });
  } catch (err) {
    return res.json({
      type: "danger",
      message: "Server error, please try again later",
    });
  }
});

// Logout route
router.get("/logout", (req, res, next) => {
  try{
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  }catch(err){
    return res.render('error', { message: "Something went wrong", error: { status: 404 } });
  }
});

module.exports = router;
