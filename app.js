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

// Database connection
mongoose.connect(process.env.DB_URI)
  .then(() => console.log('Connected to the database'))
  .catch((error) => console.error('Error connecting to database:', error));

// Middleware
app.use(cookieParser());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: false,
      httpOnly: true,
    },
  })
);

app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  if (req.session.message) {
    res.locals.message = req.session.message;
    delete req.session.message;
  } else {
    res.locals.message = null;
  }
  next();
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.use('/', indexRouter);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});