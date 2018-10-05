const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const bcrypt = require('bcrypt')
const PORT = 8080
const cookieSession = require('cookie-session')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  secret: 'A dog jumped over the fence'
}))
app.set('view engine', 'ejs')

const urlDatabase = {
  'b2xvn2': {
    userID: "k98mep",
    shortURL: 'b2xvn2',
    longURL: "http://www.lighthouselabs.ca"
  },
  '9sm5xk': {
    userID: "b4525",
    shortURL: '9sm5xK',
    longURL: "http://www.google.com"
  }
}

const users = {
  b4525: {
    id: "b4525",
    email: "bob@example.com",
    password: bcrypt.hashSync("123", 10)
  },
 k98mep: {
    id: "k98mep",
    email: "john@example.com",
    password: bcrypt.hashSync("321", 10)
  }
}

// Generate random 6 string function
const generateRandomString = () => {
  var alphanumeric = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',0,1,2,3,4,5,6,7,8,9]
  var result = ''

  for (var i = 0; i < 6; i++) {
    result += alphanumeric[Math.floor(Math.random() * alphanumeric.length)]
  }

  return result
}

// Function to filter out urls for individual users
const urlsForUsers = (id) => {
  let object = {}

  for (let link in urlDatabase) {
    if (urlDatabase[link].userID === id) {
      object[link] = urlDatabase[link]
    }
  }

  return object
}

// Function to match given email with email from users database

const match = (email) => {
  let matching;

  for (let user in users) {
    if (users[user].email === email) {
      return matching = users[user]
    } else {
      matching = false
    }
  }
  return matching
}

app.get('/', (req, res) => {
  res.redirect('/urls')
})


app.get('/urls', (req, res) => {

  let templateVars;
  if (req.session.user_id) {
    const filteredLinks = urlsForUsers(req.session.user_id)
      templateVars = {
      user_id: users[req.session.user_id],
      urls: urlDatabase,
      sorted: filteredLinks
    }
  } else {
    templateVars = {
      user_id: users[req.session.user_id],
    }
  }

  res.render('urls_index', templateVars)
})

app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login')
  } else {
    res.render('urls_new', { user_id: users[req.session.user_id] })
  }
})

app.get('/urls/:id', (req, res) => {
  let templateVars = { user_id: users[req.session.user_id], shortURL: req.params.id, urls: urlDatabase }

  if (!req.session.user_id) {
    res.send('Please login first!')
  } else if (!urlDatabase[req.params.id]) {
    res.send('Does not exist!')
  } else if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.send('No permission to view this page!')
  } else {
   res.render('urls_show', templateVars)
  }
})

app.get('/u/:shortURL', (req, res) => {

  let longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL)
})

//Bug in this section
app.post('/urls', (req, res) => {
  const shortForm = generateRandomString()
  urlDatabase[shortForm] = {
    userID: req.session.user_id,
    shortURL: shortForm,
    longURL: 'http://' + req.body.longURL
  }
  res.redirect('/urls/' + shortForm)
})

app.post('/urls/:id', (req, res) => {
  const linkOwner = urlDatabase[req.params.id].userID
  if (req.session.user_id !== linkOwner) {
    res.send('Sorry, no permission to do that')
  } else {
    urlDatabase[req.params.id].longURL = 'http://' + req.body.longURLNew
    res.redirect('/urls')
  }
})

app.post('/urls/:id/delete', (req, res) => {
  const linkOwner = urlDatabase[req.params.id].userID
  if (req.session.user_id !== linkOwner) {
    res.send('Sorry, no permission to do that')
  } else {
    delete urlDatabase[req.params.id]
    res.redirect('/urls')
  }
})

app.get('/login', (req, res) => {
  res.render('urls_login', { user_id: users[req.session.user_id] })
})

app.post('/login', (req, res) => {
  const { email, password } = req.body

  const userMatch = match(email)

  if (userMatch && bcrypt.compareSync(password, userMatch.password)) {
    req.session.user_id = userMatch.id
    res.redirect('/urls')
  } else {
    res.status(403).send('Email or password not matching')
  }
})

app.post('/logout', (req, res) => {
  req.session = null
  res.redirect('/urls')
})

app.get('/register', (req, res) => {
  res.render('urls_register', { user_id: users[req.session.user_id] })
})

app.post('/register', (req, res) => {
  const id = generateRandomString()
  const { email, password } = req.body
  const hashedPass = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    res.status(400).send('Email and password required')
  } else {
    users[id] = {
      id,
      email,
      password: hashedPass
    }
    req.session.user_id = id
    res.redirect('/urls')
  }
})

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`)
})