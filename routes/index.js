var express = require("express");
var router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { langs, cards, users } = require("../data");

//image upload
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single("image");

//insert user into databse route
router.post("/add", upload, async (req, res) => {
  try {
    console.log("add api");

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file.filename,
    });

    await user.save();

    res.json({
      type: "success",
      message: "User added successfully!",
    });
  } catch (err) {
    res.json({
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
      image: user.image,
    });
  } catch (err) {
    return res.status(500).json({
      type: "danger",
      message: "Server error, please try again later",
    });
  }
});

// Update user data
router.post("/update/:id", upload, async (req, res) => {
  try {
    const id = req.params.id;
    let new_image = req.body.old_image;

    console.log("id : ",id);
    console.log(typeof id);

    if (req.file) {
      new_image = req.file.filename;
      try {
        fs.unlinkSync("./uploads/" + req.body.old_image);
      } catch (err) {
        console.log(err);
      }
    }

    await User.findByIdAndUpdate(id, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: new_image,
    });

    res.json({
      type: "success",
      message: "User updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.json({
      type: "danger",
      message: "Server error, please try again",
    });
  }
});


//delete an user from the index page
router.get("/delete/:id", async (req, res) => {
  try {
    console.log("delete API called");
    const id = req.params.id;
    console.log("User ID:", id);

    const user = await User.findById(id);
    if (!user) {
      return res.json({
        type: "danger",
        message: "User not found",
      });
    }

    const imagePath = path.join(__dirname, "../uploads", user.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await User.findByIdAndDelete(id);

    return res.json({
      type: "success",
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.json({
      type: "danger",
      message: "Server error, please try again later",
    });
  }
});

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
  if (req.session.user) {
    return res.redirect("/home");
  }
  return res.render("index");
});

// Login route
router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with matching email and password
    const user = users.find(
      (user) => user.email === email && user.password === password
    );

    if (user) {
      req.session.user = user.email;
      // Send success response
      return res.json({
        success: true,
        message: "Login successful! Redirecting...",
        redirectUrl: "/home",
      });
    } else {
      // Send error response
      return res.json({
        success: false,
        message: "Invalid username or password",
      });
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
});

// Home route (requires login)
router.get("/home", checkLogin, async (req, res) => {
  const userList = await User.find();
  const userEmail = req.session.user;
  const name = userEmail.split("@")[0];
  res.render("home", { name, cards, langs, userList });
});

// Logout route
router.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
