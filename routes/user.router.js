var express = require('express');
var mongoose = require('mongoose');
var randomstring = require("randomstring");
var router = express.Router();

var validationService = require('../_services/validation.service');
var messageService = require('../_services/message.service');
var validate = new validationService.Validation();
var msg = messageService.Message;
var msgRep = new messageService.Message();
var timeService = require('../_services/time.service');
var time = new timeService.Time();

var mail = require('../_services/mail.service');
var mailService = new mail.MailService();

var nodemailer = require('nodemailer');

var ObjectId = require('mongoose').Types.ObjectId;

// create Account object
var Account = require('../model/account');
var Role = require('../model/role');
var Connect = require('../model/connect');
var Student = require('../model/student');
var Class = require('../model/class');
var Course = require('../model/course');
var Key = require('../model/key');
var AuthKey = require('../model/auth_key');

router.use(function (req, res, next) {
    console.log('router_account is connecting');
    next();
});

const hash_key = 'embassy';
const token_length = 64;

function hash(content) {
    const crypto = require('crypto');
    const hash = crypto.createHmac('sha256', hash_key)
        .update(content)
        .digest('hex');
    return hash;
}

function getToken() {
    var crypto = require('crypto');
    var token = crypto.randomBytes(token_length).toString('hex');
    return token;
}

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'YukoTesting01@gmail.com',
        pass: '789632145'
    }
});

//POST -- Authentication
router.route('/login').post((req, res) => {
    try {
        //get data in request body
        var username = req.body.username;
        var password = hash(req.body.password);

        var loginAt = time.getCurrentTime();

        //check exist [username]
        Account.findOne({ username: username }).populate('role')
            .exec((err, account) => {
                if (!err) {
                    //not exist [username]
                    if (account === null) {
                        return res.json({
                            status: false,
                            message: msg.msg_username_notExist
                        });
                    }

                    //exist [username]
                    else {
                        if (account.status === false) {
                            return res.json({
                                status: false,
                                message: 'Your account has been deleted'
                            })
                        }

                        //check valid [password] 
                        //valid
                        if (password == account.password) {

                            Account.findOneAndUpdate(
                                {
                                    _id: account._id
                                },
                                {
                                    $set:
                                    {
                                        'session.loginAt': loginAt,
                                        token: getToken()
                                    }
                                },
                                {
                                    upsert: true
                                },
                                (err, data) => {
                                    if (!err) {
                                        Account.findOne({ _id: account._id }).exec((err, user) => {
                                            if (!err) {
                                                return res.send(msgRep.msgData(true, msg.msg_success, user));
                                            } else {
                                                return res.send(msgRep.msgFailedOut(false, err));
                                            }
                                        })
                                    } else {
                                        return res.send(msgRep.msgFailedOut(false, err));
                                    }
                                });
                        }

                        //invalid
                        else {
                            return res.send(msgRep.msgFailedOut(false, msg.msg_password_invalid));
                        }
                    }
                } else {
                    return res.send(msgRep.msgFailedOut(false, err));
                }
            });
    } catch (error) {
        return res.send(msgRep.msgFailedOut(false, err));
    }
});

//POST -- Create Account
router.route('/register').post((req, res) => {
    var account = new Account();

    //get data in request body
    account.username = req.body.username;
    account.password = hash(req.body.password);
    account.info.email = req.body.email || "";
    account.info.name = req.body.name || "";
    account.role = req.body.role;
    account.status = true;
    account.token = null;

    account.createAt = time.getCurrentTime();
    account.updateAt = time.getCurrentTime();

    //validate 
    var error = account.validateSync();

    //invalid
    if (error) {
        return res.json({
            error: error.errors,
            status: false,
            message: msg.msg_failed
        });
    }

    //valid
    else {

        //validate [password]
        //invalid [password]
        if (!validate.passwordValidate(req.body.password)) {
            return res.json({
                status: false,
                error: {
                    password: {
                        message: msg.msg_password_invalid,
                        name: "ValidatorError",
                        value: req.body.password
                    }
                }
            })
        }

        //valid [password]
        else {
            Role.findOne({ _id: req.body.role, status: true }).exec((error, role) => {
                if (error) {
                    return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                } else {
                    if (validate.isEmpty(role)) {
                        return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
                    } else {
                        account.roleTest = role;

                        //check duplicate [email]
                        Account.findOne({ 'info.email': account.info.email }).exec((err, acc) => {

                            //duplicate [email]
                            if (acc !== null) {
                                return res.json({
                                    status: false,
                                    message: msg.msg_email_exist
                                });
                            }

                            //non-duplicate [email]
                            else {
                                account.save((err, data) => {
                                    if (err) return res.send(err);
                                    else {
                                        console.log('Auth_KEY');
                                        console.log(data);

                                        let stringKey = randomstring.generate(30);
                                        let urlKey = data._id + '-' + stringKey;

                                        let authKey = new AuthKey();
                                        authKey.userId = data._id;
                                        authKey.access_token = getToken();
                                        authKey.key = stringKey;
                                        authKey.isActivated = false;
                                        authKey.createAt = new Date();
                                        authKey.status = true;

                                        authKey.save((error) => {
                                            if (error) {
                                                return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                                            } else {
                                                let url = "http://localhost:4200/authConfirm/" + urlKey;

                                                let mailOptions = {
                                                    from: '"Admin" <YukoTesting01@gmail.com>', // sender address
                                                    to: account.info.email, // list of receivers
                                                    subject: 'Confirm Account', // Subject line
                                                    text: 'Confirm your account: ' + url, // plain text body
                                                    // html: '<b>Test HTML</b>' // html body
                                                };

                                                // send mail with defined transport object
                                                transporter.sendMail(mailOptions, (error, info) => {
                                                    if (error) {
                                                        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                                                    }
                                                    console.log('Message %s sent: %s', info.messageId, info.response);
                                                    // return res.status(200).send(msgRep.msgData(true, msg.msg_success));
                                                    return res.status(200).json({
                                                        status: true,
                                                        account: {
                                                            username: account.username,
                                                            info: account.info,
                                                            role: account.role,
                                                            roleTest: account.roleTest
                                                        },
                                                        message: msg.msg_success
                                                    });
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    }
});

//PUT
router.route('/update').put((req, res) => {
    var id = req.body.id;
    var email = req.body.email;
    var name = req.body.name;

    var updateAt = time.getCurrentTime();

    if (!validate.emailValidate(email) || !validate.nameValidate(name)) {
        return res.json({
            status: false,
            message: 'Validate failed'
        })
    };

    Account.findOne({ _id: id, status: true }).exec((err, acc) => {
        if (!err) {
            //not null
            if (acc !== null) {
                //check duplicate [email]
                if (email !== acc.info.email) {
                    Account.findOne({ 'info.email': email, status: true }).exec((err, acc) => {
                        if (!err) {
                            if (acc !== null) {
                                return res.json({
                                    status: false,
                                    message: msg.msg_email_exist
                                });
                            } else {
                                //udpate 
                                Account.findOneAndUpdate(
                                    {
                                        _id: id
                                    },
                                    {
                                        $set:
                                        {
                                            'info.email': email,
                                            'info.name': name,
                                            updateAt: updateAt
                                        }
                                    },
                                    {
                                        upsert: true
                                    },
                                    (err, account) => {
                                        if (!err) {
                                            return res.json({
                                                status: true,
                                                message: msg.msg_success
                                            });
                                        } else {
                                            return res.json({
                                                error: err,
                                                status: false,
                                                message: msg.msg_failed
                                            })
                                        }
                                    });
                            }
                        } else {
                            return res.json({
                                status: false,
                                message: err
                            });
                        }
                    });
                }

                // duplicated [Email]
                else {
                    //update 
                    Account.findOneAndUpdate(
                        {
                            _id: id
                        },
                        {
                            $set:
                            {
                                'info.email': email,
                                'info.name': name,
                                updateAt: updateAt
                            }
                        },
                        {
                            upsert: true
                        },
                        (err, account) => {
                            if (!err) {
                                return res.json({
                                    status: true,
                                    message: msg.msg_success
                                });
                            } else {
                                return res.json({
                                    error: err,
                                    status: false,
                                    message: msg.msg_failed
                                })
                            }
                        });
                }
            } else {
                return res.json({
                    status: false,
                    message: msg.msg_failed
                });
            }
        } else {
            return res.json({
                status: false,
                message: msg.msg_failed
            });
        }
    });
});

router.route('/confirmAccount').post((req, res) => {
    try {
        let userId = req.body.id;
        let key = req.body.key;

        AuthKey.findOne({ userId: userId, key: key, isActivated: false }).exec((error, data) => {
            if (error) {
                return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
            } else {
                if (validate.isEmpty(data)) {
                    return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
                } else {
                    AuthKey.findOneAndUpdate(
                        {
                            userId: userId,
                            key: key,
                            isActivated: false
                        },
                        {
                            $set: {
                                isActivated: true
                            }
                        },
                        {
                            upsert: true
                        },
                        (error) => {
                            if (error) return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                            return res.status(200).send(msgRep.msgData(true, msg.msg_success));
                        }
                    )
                }
            }
        });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
    }
});

router.route('/resetPassword').post((req, res) => {
    try {
        let id = req.body.id;
        let oldPw = req.body.oldPw;
        let newPw = req.body.newPw;

        let pw = hash(oldPw);

        Account.findOne({ _id: id }).exec((error, data) => {
            if (error) {
                return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
            } else {
                if (validate.isEmpty(data)) {
                    return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
                } else {
                    if (data.password == pw) {
                        Account.findOneAndUpdate(
                            {
                                _id: id
                            },
                            {
                                $set: {
                                    password: hash(newPw)
                                }
                            },
                            {
                                upsert: true
                            },
                            (error) => {
                                if (error) return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                                return res.status(200).send(msgRep.msgData(true, msg.msg_success));
                            }
                        )
                    } else {
                        return res.status(200).send(msgRep.msgData(false, 'PASSWORD_NOT_MATCH'));
                    }
                }
            }
        })
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
    }
});

router.route('/sendPassword').post((req, res) => {
    try {
        let id = req.body.id;
        let stringKey = req.body.key;

        let date = new Date();

        let newPw = randomstring.generate(7);
        let pw = hash(newPw);

        Key.findOne({ key: stringKey, status: true }).exec((error, data) => {
            if (error) {
                return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
            } else {
                if (validate.isEmpty(data)) {
                    return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
                } else {
                    // let d = new Date();
                    let d = date.getDate() - data.createAt.getDate();

                    console.log(d);
                    if (d <= 7) {
                        Account.findOneAndUpdate(
                            {
                                _id: id,
                                status: true
                            },
                            {
                                $set: {
                                    password: pw
                                }
                            },
                            {
                                upsert: true
                            },
                            (error, account) => {
                                if (error) {
                                    return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                                } else {
                                    Key.findOneAndUpdate(
                                        {
                                            _id: data._id
                                        },
                                        {
                                            $set: {
                                                status: false
                                            }
                                        },
                                        {
                                            upsert: true
                                        },
                                        (error) => {
                                            if (error) return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                                            let mailOptions = {
                                                from: '"Admin" <YukoTesting01@gmail.com>', // sender address
                                                to: account.info.email, // list of receivers
                                                subject: 'Reset your password', // Subject line
                                                text: 'Your new password is: ' + newPw, // plain text body
                                                // html: '<b>Test HTML</b>' // html body
                                            };

                                            // send mail with defined transport object
                                            transporter.sendMail(mailOptions, (error, info) => {
                                                if (error) {
                                                    return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                                                }
                                                console.log('Message %s sent: %s', info.messageId, info.response);
                                                return res.status(200).send(msgRep.msgData(true, msg.msg_success));
                                            });
                                            // mailService.resetPassword(account.info.email, newPw, res);
                                        }
                                    )
                                }
                            }
                        );
                    } else {
                        return res.status(200).send(msgRep.msgData(false, "OUT_OF_DATE"));
                    }
                }
            }
        });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
    }
});

router.route('/forgotPassword').post((req, res) => {
    try {
        let email = req.body.email;

        Account.findOne({ 'info.email': email, status: true }).exec((error, data) => {
            if (error) {
                return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
            } else {
                if (validate.isEmpty(data)) {
                    return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
                } else {
                    let stringKey = randomstring.generate(30);
                    let id = data._id + '-' + stringKey;

                    console.log(data);

                    Key.findOne({ email: email, status: true }).exec((error, k) => {
                        if (error) {
                            return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                        } else {
                            if (validate.isEmpty(k)) {
                                let key = new Key();
                                key.key = stringKey;
                                key.email = email;
                                key.createAt = new Date();
                                key.updateAt = new Date();
                                key.status = true;

                                key.save((error) => {
                                    if (error) return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                                    else {
                                        console.log('else');

                                        let url = "http://localhost:4200/confirm/" + id;

                                        // setup email data with unicode symbols
                                        let mailOptions = {
                                            from: '"Admin" <YukoTesting01@gmail.com>', // sender address
                                            to: email, // list of receivers
                                            subject: 'Confirm to reset your password', // Subject line
                                            text: 'Click this link (Effectively within 7 days): ' + url, // plain text body
                                            // html: '<b>Test HTML</b>' // html body
                                        };

                                        // send mail with defined transport object
                                        transporter.sendMail(mailOptions, (error, info) => {
                                            if (error) {
                                                return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                                            }
                                            // console.log('Message %s sent: %s', info.messageId, info.response);
                                            console.log(info);
                                            return res.status(200).send(msgRep.msgData(true, msg.msg_success));
                                        });
                                    }
                                    // mailService.confirmResetPassword(id, email, res);
                                });
                            } else {
                                Key.findOneAndUpdate(
                                    {
                                        email: email,
                                        status: true
                                    },
                                    {
                                        $set: {
                                            key: stringKey,
                                            createAt: new Date(),
                                            updateAt: new Date()
                                        }
                                    },
                                    {
                                        upsert: true
                                    },
                                    (error) => {
                                        if (error) return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                                        else {
                                            console.log('else');

                                            let url = "http://localhost:4200/confirm/" + id;

                                            // setup email data with unicode symbols
                                            let mailOptions = {
                                                from: '"Admin" <YukoTesting01@gmail.com>', // sender address
                                                to: email, // list of receivers
                                                subject: 'Confirm to reset your password', // Subject line
                                                text: 'Click this link (Effectively within 7 days): ' + url, // plain text body
                                                // html: '<b>Test HTML</b>' // html body
                                            };

                                            // send mail with defined transport object
                                            transporter.sendMail(mailOptions, (error, info) => {
                                                if (error) {
                                                    return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                                                }
                                                // console.log('Message %s sent: %s', info.messageId, info.response);
                                                console.log(info);
                                                return res.status(200).send(msgRep.msgData(true, msg.msg_success));
                                            });
                                        }
                                        // mailService.confirmResetPassword(id, email, res);
                                    }
                                )
                            }
                        }
                    });
                }
            }
        });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
    }
});

router.route('/getConnectAccount').get((req, res) => {
    try {
        let id = req.query.id;
        console.log(id);

        var matchQuery = {
            'connect.account': new ObjectId(id),
            status: true
        };

        Connect.aggregate(
            [
                {
                    $match: matchQuery
                },
                {
                    $project: {
                        student: '$connect.student'
                    }
                }
            ],
            (error, data) => {
                if (error) {
                    return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                } else {
                    if (validate.isEmpty(data)) {
                        return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
                    } else {
                        Student.populate(data[0], { path: 'student', select: 'info classes' }, (error, result) => {
                            if (error) {
                                return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                            } else {
                                if (validate.isEmpty(result)) {
                                    return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
                                } else {
                                    Class.populate(result, { path: 'student.classes.class', select: 'info.name info.progress info.startAt info.course' }, (error, das) => {
                                        if (error) {
                                            return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                                        } else {
                                            if (validate.isEmpty(das)) {
                                                return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
                                            } else {
                                                Course.populate(das, { path: 'student.classes.class.info.course', select: 'info.name' }, (error, das) => {
                                                    if (error) {
                                                        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                                                    } else {
                                                        if (validate.isEmpty(das)) {
                                                            return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
                                                        } else {
                                                            return res.status(200).send(msgRep.msgData(true, msg.msg_success, das));
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            }
        )
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
    }
});

router.route('/getClassInfo').get((req, res) => {
    try {
        let id = req.query.id;
        let studentId = req.query.studentId;

        var matchQuery = {
            _id: new ObjectId(id),
            status: true
        };

        Class.aggregate(
            [
                {
                    $match: matchQuery
                },
                {
                    $project: {
                        students: 1,
                        attendances: 1
                    }
                }
            ],
            (error, data) => {
                console.log(data);
                if (error) {
                    return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                } else {
                    if (validate.isEmpty(data)) {
                        return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
                    } else {
                        let students = data[0].students;
                        let attendances = data[0].attendances;

                        var score = {};
                        var atts = new Array();

                        for (let i = 0; i < students.length; i++) {
                            if (students[i].student == studentId) {
                                score = students[i].score;
                            }
                        }

                        for (let i = 0; i < attendances.length; i++) {
                            for (let j = 0; j < attendances[i].students.length; j++) {
                                if (attendances[i].students[j].student == studentId) {
                                    atts.push(attendances[i].date);
                                    break;
                                }
                            }
                        }
                        // console.log(students);
                        // console.log(attendances);

                        console.log(score);
                        console.log(atts);

                        let jsonRes = {
                            score: score,
                            attendances: atts
                        }

                        return res.status(200).send(msgRep.msgData(true, msg.msg_success, jsonRes));

                        // Student.populate(data[0], { path: 'student', select: 'info' }, (error, result) => {
                        //     return res.status(200).send(msgRep.msgData(true, msg.msg_success, result));
                        // });
                    }
                }
            }
        )
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
    }
});

module.exports = router;
