var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var PORT = 8080
const cookieParser = require('cookie-parser')

// Generate random 6 string function
function generateRandomString() {
  var alphanumeric = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',0,1,2,3,4,5,6,7,8,9]
  var result = ''

  for (var i = 0; i < 6; i++) {
    result += alphanumeric[Math.floor(Math.random() * alphanumeric.length)]
  }

  return result
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set('view engine', 'ejs')

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

const users = {
  b4525: {
    id: "b4525",
    email: "bob@example.com",
    password: "123"
  },
 k98mep: {
    id: "k98mep",
    email: "john@example.com",
    password: "321"
  }
}

app.get('/', (req, res) => {
  res.redirect('/urls')
})


app.get('/urls', (req, res) => {
  let templateVars = {
    user_id: users[req.cookies.user_id],
    urls: urlDatabase
  }
  res.render('urls_index', templateVars)
})

app.get('/urls/new', (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect('/login')
  } else {
    res.render('urls_new', { user_id: users[req.cookies.user_id] })
  }
})

app.get('/urls/:id', (req, res) => {
  let templateVars = { user_id: users[req.cookies.user_id], shortURL: req.params.id, urls: urlDatabase }
  res.render('urls_show', templateVars)
})

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL)
})

app.post('/urls', (req, res) => {
  var shortForm = generateRandomString()
  urlDatabase[shortForm] = 'http://' + req.body.longURL
  res.redirect('/urls/' + shortForm)
})

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = 'http://' + req.body.longURLNew
  res.redirect('/urls')
})

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls')
})

app.get('/login', (req, res) => {
  res.render('urls_login', { user_id: users[req.cookies.user_id] })
})

app.post('/login', (req, res) => {
  const { email, password } = req.body

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

  const userMatch = match(email)
  console.log(userMatch)

  if (userMatch && userMatch.password === password) {
    res.cookie('user_id', userMatch.id)
    res.redirect('/urls')
  } else {
    res.status(403).send('Email or password not matching')
  }
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls')
})

app.get('/register', (req, res) => {
  res.render('urls_register', { user_id: users[req.cookies.user_id] })
})

app.post('/register', (req, res) => {
  const id = generateRandomString()
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).send('Email and password required')
  } else {
    users[id] = {
      id,
      email,
      password
    }
    res.cookie('user_id', id)
    res.redirect('/urls')
  }
})

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`)
})