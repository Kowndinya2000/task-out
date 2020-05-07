var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session')
const passport = require('passport')
const WebAppStrategy = require('ibmcloud-appid').WebAppStrategy
var methodOverride = require('method-override')
var bodyParser = require("body-parser")
var cors = require('cors')
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors({
    credentials: true,
}))
app.use(methodOverride('_method'))
var indexRouter = require('./routes/index');
var notificationsRouter = require('./routes/notifications');
var pushnotificationsRouter = require('./routes/pushnotifications')
var uploadRouter = require('./routes/upload')
var filesRouter = require('./routes/files')
var galleryRouter = require('./routes/gallery')
var imageRouter = require('./routes/image')
var delEventRouter = require('./routes/delEvent')

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: '123456',
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser((user,cb)=>cb(null,user))
passport.deserializeUser((user,cb)=>cb(null,user))
passport.use(new WebAppStrategy({
  tenantId: "c67db998-e74a-4e95-ab05-7325ca80414e",
  clientId: "fb378d92-0180-4b2d-88ca-b0376fd32251",
  secret: "NjE1ZTU0YzctOTRjZC00ZWE1LWE4OGEtMjZlYjRkZWVlYWY2",
  oauthServerUrl:"https://eu-gb.appid.cloud.ibm.com/oauth/v4/c67db998-e74a-4e95-ab05-7325ca80414e",
  redirectUri: "http://localhost:3000/appid/callback"
}))
app.get('/appid/login',passport.authenticate(WebAppStrategy.STRATEGY_NAME,{
  successRedirect: '/',
  forceLogin: true
}))
//Handle callback
app.get('/appid/callback',passport.authenticate(WebAppStrategy.STRATEGY_NAME))
// Handle logout
app.get('/appid/logout',function(req,res){
  WebAppStrategy.logout(req)
  res.redirect('/')
})
app.use('/api',(req,res,next)=>{
  if(req.user)
  {
      next()
  }
  else{
      res.status(401).send("Unauthorized")
  }
})
app.get('/api/user',(req,res)=>{
console.log(req.user)
if(req.user.picture)
{
  res.json({
    user: {
        name: req.user.name,
        email: req.user.email,
        picture: req.user.picture
    }
  })
}
else{
  res.json({
    user: {
        name: req.user.name,
        email: req.user.email
    }
  })
}
})
app.use('/', indexRouter);
app.use('/notifications', notificationsRouter);
app.use('/pushnotifications', pushnotificationsRouter);
app.use('/delEvent', delEventRouter);
app.use('/upload', uploadRouter);
app.use('/files',filesRouter);
app.use('/gallery',galleryRouter);
app.use('/image',imageRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
