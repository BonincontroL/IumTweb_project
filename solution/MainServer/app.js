var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var competitionsRouter = require('./routes/competitions');
var gamelineupsRouter = require('./routes/gamelineups');
var playersRouter = require('./routes/players');
var gamesRouter = require('./routes/games');
var clubsRouter = require('./routes/clubs');
var gameeventsRouter = require('./routes/gameevents');
var appearancesRouter = require('./routes/appearances');
var playervaluationsRouter = require('./routes/player_valuations');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/appearances', appearancesRouter);
app.use('/competitions', competitionsRouter);
app.use('/gamelineups', gamelineupsRouter);
app.use('/players', playersRouter);
app.use('/games', gamesRouter);
app.use('/clubs', clubsRouter);
app.use('/gameevents', gameeventsRouter);
app.use('/player_valuations', playervaluationsRouter)

const swaggerUi = require('swagger-ui-express');
const openApiDocumentation = require('./swagger/swaggerDocumentation.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocumentation));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    if (err.status === 404) {
        res.status(404).sendFile(path.join(__dirname, 'public', 'Error404.html'));
    } else {
        res.status(err.status || 500);
        res.render('error');
    }
});

module.exports = app;
