//DATABSE
const langs = ["HTML", "CSS", "JAVASCRIPT", "REACT", "NODEJS", "EXPRESS"]
const students = [
  {
    id: 1,
    name: "John Doe",
    age: 20,
    grade: "A",
    subject: "Math",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 22,
    grade: "B",
    subject: "History",
  },
  {
    id: 3,
    name: "Alice Johnson",
    age: 19,
    grade: "C",
    subject: "English",
  },
  {
    id: 4,
    name: "Bob Wilson",
    age: 21,
    grade: "B+",
    subject: "Science",
  },
  {
    id: 5,
    name: "Eve Davis",
    age: 23,
    grade: "A-",
    subject: "Computer Science",
  },
];
const cards = [
  {
    cardHeader: "Mongo DB",
    cardContent: "Use MongoDB as the database to store and manage data in a flexible, scalable, and schema-less manner.",
    cardFooter: "Learn more"
  },
  {
    cardHeader: "Express",
    cardContent: "Use Express.js as the back-end application framework to handle HTTP requests and responses.",
    cardFooter: "Read more"
  },
  {
    cardHeader: "React",
    cardContent: "React is a powerful and efficient JavaScript library for creating dynamic, interactive, and fast UIs.",
    cardFooter: "Learn more"
  },
  {
    cardHeader: "Node",
    cardContent: "Use Node.js as the server-side runtime ENV to run JS code that allows you to build scalable applications..",
    cardFooter: "Read more"
  }
];

const users = [
  { email: 'admin@gmail.com', password: '123' },
  { email: 'midhun@gmail.com', password: '456' }
];

//DATABSE

var express = require('express');
const session = require('express-session')
var app = express()
const cookieParser = require('cookie-parser')

app.use(cookieParser())
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: true,
    httpOnly: true,
  }
}))

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

app.use(express.urlencoded({ extended: true }))
app.use(express.json())



/* GET home page. */
app.get('/', (req, res, next) => {
 res.render('index')
});

app.post('/login', (req, res, next) => {
  const { email, password } = req.body;
  const user = users.find((user) => user.email === email && user.password === password);
  if (user) {
    req.session.user = user.email;
    const emailParts = user.email.split('@');
    const name = emailParts[0];
    res.render('home', { name, cards, langs, students });
  } else {
    res.render('index', { message: 'Invalid username or password' });
  }
});

app.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err)
      next(err);
    } else {
      res.redirect('/')
    }
  })
})

module.exports = app;
