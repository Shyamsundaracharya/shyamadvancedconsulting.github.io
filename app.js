const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require('lodash');

const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');
const connectDB = require('./config/db');

/*now usig mongoose database for myblog*/
const mongoose = require('mongoose');
dotenv.config();

/*This is for authenication*/
// const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const session = require('express-session');
const methodOverride = require('method-override');

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);




app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.static('public'));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
  })
);



app.use(passport.initialize());
app.use(passport.session());

/*connecting with database*/
connectDB();

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// Initialize Passport

const {
  authUser,
  checkAuthenticated,
  checkNotAuthenticated,
  authRole,
  adminUser,
} = require('./middleware/auth');

// Common static pages in homerouter
app.use('/', require('./routes/homeroute'));

/*______________________________________________________________*/

/* GET login page. */
app.get('/login', function (req, res) {
  res.render('index', {
    errorMessages: '',
    events: '',
    isAuthenticated: req.isAuthenticated(),
  });
});

/* GET Registration Page */
app.get('/register', checkAuthenticated, function (req, res) {
  res.render('index', {
    errorMessages: '',
    events: '',
    isAuthenticated: req.isAuthenticated(),
  });
});

app.post('/register', function (req, res) {
  User.register(
    {
      username: req.body.username,
    },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log('error registering user' + err);
        res.render('index', {
          errorMessages: 'Error during registration. Please try again',
          events: '',
          isAuthenticated: req.isAuthenticated(),
        });
        return;
      }

      passport.authenticate('local')(req, res, function () {
    
        res.render('index', {
          errorMessages:
            'You are successfully registered! Now you can login here',
          events: '',
          isAuthenticated: req.isAuthenticated(),
        });
      });
    }
  );
});

// app.post("/login", function(req, res) {

//   const user = new User({
//     username: req.body.username,
//     password: req.body.password
//   });

//   req.login(user, function(err) {
//     if (err) {
//       console.log(err);
//       return;

//     } else {
//       passport.authenticate("local")(req, res, function() {

//         res.render("admindashboard1");
//       })
//     }
//   })
// })
app.post('/login', function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
      return;
    } else {
      passport.authenticate('local', function (err, user, info) {
        if (err) {
          console.log(err);
          return;
        }

        if (!user) {
          res.render('index', {
            errorMessages:
              "You don't have account! To Create an account call Adminitstrator",
            isAuthenticated: req.isAuthenticated(),
            events: '',
          });
        }

        req.logIn(user, function (err) {
          if (err) {
            console.log(err);
            return;
          }

          res.render('admindashboard1');
        });
      })(req, res);
    }
  });
});



/* Handle Logout */
app.get('/signout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  
    res.redirect('/');
  });
});



app.get('*', (req, res) => {
  res.render('404');
});

app.listen(process.env.PORT || 4000, function () {
  console.log('Server started on port   4000');
});
