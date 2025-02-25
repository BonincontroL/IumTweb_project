var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const database = require("./databases/database")

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var gameRouter = require('./routes/games');
var gamelineupsRouter = require('./routes/gamelineups');
var clubgamesRouter = require('./routes/clubgames');
var gameeventsRouter = require('./routes/gameevents');
var appearencesRouter = require('./routes/appearances');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/games', gameRouter);
app.use('/gamelineups', gamelineupsRouter);
app.use('/clubgames', clubgamesRouter);
app.use('/gameevents', gameeventsRouter);
app.use('/appearances', appearencesRouter);


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
