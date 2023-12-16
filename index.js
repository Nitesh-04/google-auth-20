import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config(); 

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.use(
  session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);


app.use(passport.initialize());
app.use(passport.session());


passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});


app.get("/", (req, res) => {
  res.sendFile("index.html");
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/auth/protected',
    failureRedirect: '/auth/google/failure'
  }));

app.get("/auth/protected", isLoggedIn, (req, res) => {
  let name = req.user.displayName;
  let mail=req.user.emails[0].value;
  res.send(`Hello ${name} mail : ${mail}`);
});

app.get("/auth/google/failure", (req, res) => {
  res.send("Something went wrong");
});


app.listen(port, () => {
  console.log("Port 3000, copy over!");
});

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

/*function isLoggedIn(req, res, next) {
    if (req.user && req.user.emails && req.user.emails.length > 0) {
      const userDomain = req.user.emails[0].value.split('@')[1];
      if (userDomain === '(domain)')
      { 
        return next();
      }
    }
    res.sendStatus(401);
  }
*/