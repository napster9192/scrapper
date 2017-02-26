var express = require('express');
var compression = require('compression');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var indexRoute = require('./routes/index');
var scrapRoute = require('./routes/scrap');
var bluebird = require('bluebird');
var twig = require('twig');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

//various
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//bdd
mongoose.Promise = bluebird;
mongoose.connect('mongodb://localhost/scrapper');
app.use(function(req,res,next){
    req.mongoose = mongoose;
    next();
});

//flash messages
app.use(cookieParser('secret'));
app.use(session({	
	secret: 'scrappers cookie secret',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
app.use(function (req, res, next) {
	var flash = req.flash();
	var messageKeys = Object.keys(flash);
	var buf = [];
    buf.push('<div id="messages">');
    messageKeys.forEach(function (key) {
      var msgs = flash[key];
      if (msgs) {
        buf.push('  <ul class="' + key + '">');
        msgs.forEach(function (msg) {
          buf.push('    <li>' + msg + '</li>');
        });
        buf.push('  </ul>');
      }
    });
    buf.push('</div>');
    res.locals.flashMessages = buf.join('\n');
	next();
});

//routes
app.use('/', indexRoute);
app.use('/scrap', scrapRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

//twig filter
twig.extendFilter('encodeURIComponent', function (value) {
    return encodeURIComponent(value);
});

module.exports = app;
