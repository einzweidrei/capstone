// params
var express = require('express');
var app = express();
// var http = require('http').Server(app);
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var router = express.Router();
// var cors = require('cors');
// var SocketServer = require('ws').Server;
// var io = require('socket.io')(http);
// const path = require('path');


// var SessionStore = require("session-mongoose")(express);

// connecting mongodb
// var mongodburi = 'mongodb://localhost:27017/Capstone';
var mongodburi = 'mongodb://capstone:Anhcanem123@ds139198.mlab.com:39198/hailyuko';
mongoose.Promise = global.Promise;
mongoose.connect(mongodburi);

// session
// var store = new SessionStore({
//     interval: 120000, 
//     connection: mongoose.connection });

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

    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// var corsOptions = {
//     origin: 'https://yukoserver.herokuapp.com',
//     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }

// app.use(cors(corsOptions));

// parse application/x-www-form-urlencoded
app.use(bodyparser.urlencoded({
    extended: true
}));

// parse application/json
app.use(bodyparser.json());

router.use((req, res, next) => {
    console.log('Something is happening');
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

// HOST
// app.listen(6969, function () {
//     console.log('listening on 6969 <3')
// });

// var PORT = process.env.PORT || 3000;
// const INDEX = path.join(__dirname, 'index.html');

app.listen(process.env.PORT || 6969, function () {
    console.log('listening on 6969 <3')
});

// var wss = new SocketServer({
//     perMessageDeflate: false,
//     port: 6969
// });

// wss.on('connection', (ws) => {
//     console.log('Client connected');
//     ws.on('close', () => console.log('Client disconnected'));
// });

// setInterval(() => {
//     wss.clients.forEach((client) => {
//         client.send(new Date().toTimeString());
//     });
// }, 1000);

// io.configure(function () {
//     io.set("transports", ["xhr-polling"]);
//     io.set("polling duration", 10);
// });

// io.on('connection', function (socket) {
//     console.log('a user connected');

//     socket.on('subscribe', function (room) {
//         console.log('joining room', room);
//         socket.join(room);
//     })

//     socket.on('unsubscribe', function (room) {
//         console.log('leaving room', room);
//         socket.leave(room);
//     })

//     socket.on('send', function (data) {
//         console.log('sending message');
//         io.sockets.in(data.room).emit('message', data.message);
//     });

//     socket.on('disconnect', function () {
//         console.log('user disconnected');
//     });
// });
