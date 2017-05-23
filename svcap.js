// params
var express = require('express');
var app = express();
// var http = require('http').Server(app);
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');

var router = express.Router();

// connecting mongodb
// var mongodburi = 'mongodb://localhost:27017/Capstone';
var mongodburi = 'mongodb://capstone:Anhcanem123@ds139198.mlab.com:39198/hailyuko';
mongoose.Promise = global.Promise;
mongoose.connect(mongodburi);


// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)

    res.setHeader('Access-Control-Allow-Credentials', false);

    // Pass to next layer of middleware
    next();
});



// parse application/x-www-form-urlencoded
app.use(bodyparser.urlencoded({
    extended: true
}));

// parse application/json
app.use(bodyparser.json());

// app.use(cookieParser());

app.use((req, res, next) => {
    console.log('Something is happening');

    // console.log(req.headers);

    next();
});

// Account API
app.use('/role', require('./routes/role.router'));
app.use('/account', require('./routes/account.router'));
app.use('/permission', require('./routes/permission.router'));
app.use('/function', require('./routes/function.router'));
app.use('/class', require('./routes/class.router'));
app.use('/student', require('./routes/student.router'));
app.use('/course', require('./routes/course.router'));
app.use('/teacher', require('./routes/teacher.router'));
app.use('/staff', require('./routes/staff.router'));
app.use('/cms', require('./routes/cms.router'));
app.use('/topic', require('./routes/topic.router'));
app.use('/contest', require('./routes/contest.router'));
app.use('/advisory', require('./routes/advisory.router'));
app.use('/user', require('./routes/user.router'));

app.listen(process.env.PORT || 6969, function () {
    console.log('listening on 6969 <3')
});
