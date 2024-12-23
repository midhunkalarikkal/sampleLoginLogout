var express = require("express");
var router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");
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

      req.session.message = {
        type: "success",
        message: "User added successfully",
      };
      res.redirect("/home");
      
  } catch (err) {
    req.session.message = {
      type: "danger",
      message: "User adding error.",
    };
  }
});

//Edit an user route to get the editing page
router.get("/edit/:id", async(req, res) => {
  try {
    let id = req.params.id;
    const user = await User.findById(id);
    if (user === null) {
      res.redirect("/");
    } else {
      console.log("fetched user : ",user);
      req.session.message = {
        type: "success",
        message: "User fetched successfully",
      };
    }
  } catch (err) {
    res.json({ message: err.message, type: "danger" });
  }
});


//Edit an user route to get the editing page
router.post("/update/:id", upload , async(req,res) => {

  try{
    let id = req.params.id;
    let new_image = "";

  if(req.file){
      new_image = req.file.filename
      try{
          fs.unlinkSync("./uploads/"+req.body.old_image)
      }catch(err){
          console.log(err)
      }
  }else{
      new_image = req.body.old_image
  }

  User.findByIdAndUpdate(id ,{
      name : req.body.name,
      email : req.body.email,
      phone : req.body.phone,
      image : new_image,
  })

  req.session.message = {
    type : "success",
    message : "User updated succesfully"
}
  }catch(err){
    res.json({message : err.message, type: "danger"})
  }
});

//delete an user from the index page
router.get('/delete/:id', async(req,res)=>{
  try{
    let id = req.params.id
    const user = await User.find(id);
    const deleteImage = fs.unlinkSync("./uploads/"+user.image);
    const deleteuser = await User.findByIdAndDelete(id)

    if(deleteuser){
      req.session.message = {
        type : "success",
        message : "User deleted succesfully"
      }
    }else{
      req.session.message = {
        type : "danger",
        message : "User deletion error, please try again"
      }
    }
  }catch(err){
    res.json({message : err.message , type : "danger"})
  }
})

// Middleware to check session
function checkLogin(req, res, next) {
  console.log("checkingLogin: ", req.session.user);
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
  const { email, password } = req.body;
  const user = users.find(
    (user) => user.email === email && user.password === password
  );
  if (user) {
    req.session.user = user.email;
    res.redirect("/home");
  } else {
    res.render("index", { message: "Invalid username or password" });
  }
});

// Home route (requires login)
router.get("/home", checkLogin, async(req, res) => {
  const userList = await User.find();
  console.log("userList : ", userList);
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
