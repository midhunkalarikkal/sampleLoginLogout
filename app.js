var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const mongoose = require('mongoose');
require('dotenv').config();
var app = express();

var createError = require('http-errors');
var indexRouter = require('./routes/index');

//database connection
mongoose.connect(process.env.DB_URI)
const db = mongoose.connection
db.on("error" , (error) => console.log("Error"))
db.once("open" , ()=> console.log("Connected to the databse"))

// Middleware
app.use(cookieParser());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SECRET,

  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: false,  
    httpOnly: true,  
  }
}));
app.use("/static",express.static(path.join(__dirname, 'public')));
app.use(express.static('uploads'));

app.use((req,res,next)=>{
  res.locals.message = req.session.message
  delete req.session.message
  next()
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.use('/', indexRouter);

app.listen(3005 , ()=> {
  console.log("Server listening to port 3005");
})