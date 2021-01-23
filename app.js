const express = require('express')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const session = require('express-session')

const app = express()

require('./config/mongoose')
require('./config/passport')(passport)

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

// Routes
app.use('/', require('./routes/index.js'))

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})