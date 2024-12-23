var express = require('express');
var router = express.Router();
const { langs, students, cards, users } = require('../data');

// Middleware to check session
function checkLogin(req, res, next) {
  console.log("checkingLogin: ", req.session.user);
  if (!req.session.user) {
    return res.redirect('/');
  }
  next();
}

// Prevent caching for all routes
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Redirect logged-in users from login page to home
router.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/home');
  }
  return res.render('index');
});

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((user) => user.email === email && user.password === password);
  if (user) {
    req.session.user = user.email;
    res.redirect('/home');
  } else {
    res.render('index', { message: 'Invalid username or password' });
  }
});

// Home route (requires login)
router.get('/home', checkLogin, (req, res) => {
  const userEmail = req.session.user;
  const name = userEmail.split('@')[0];
  res.render('home', { name, cards, langs, students });
});

// Logout route
router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

module.exports = router;
