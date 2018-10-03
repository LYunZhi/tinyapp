var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var PORT = 8080

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
app.set('view engine', 'ejs')

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

app.get('/', (req, res) => {
  res.send('Hello!')
})

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase)
})

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase }
  res.render('urls_index', templateVars)
})

app.get('/urls/new', (req, res) => {
  res.render('urls_new')
})

app.get('/urls/:id', (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase }
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


app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
})

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`)
})