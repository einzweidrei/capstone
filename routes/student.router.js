var express = require('express');
var router = express.Router();

var Student = require('../model/student');
var Account = require('../model/account');
var validationService = require('../_services/validation.service');
var messageService = require('../_services/message.service');
var timeService = require('../_services/time.service');

var Connect = require('../model/connect');
var time = new timeService.Time();
var validate = new validationService.Validation();
var msg = messageService.Message;
var msgRep = new messageService.Message();

router.use(function (req, res, next) {
    console.log('student_router is connecting');
    next();
});

function checkIsValid(item) {
    if (typeof item === 'undefined' || item === null || item === '') {
        return false;
    }
    return true;
}

//GET -- Get All Students
router.route('/getAll').get((req, res) => {
    try {
        var page = req.query.page;
        var firstName = req.query.firstName;
        var lastName = req.query.lastName;
        var query = { status: true };

        if (checkIsValid(firstName) && checkIsValid(lastName)) {
            query = {
                'info.name.firstName': firstName,
                'info.name.lastName': lastName,
                status: true
            }
        } else {
            if (checkIsValid(firstName) && !checkIsValid(lastName)) {
                query = {
                    'info.name.firstName': firstName,
                    status: true
                }
            } else if (!checkIsValid(firstName) && checkIsValid(lastName)) {
                query = {
                    'info.name.lastName': lastName,
                    status: true
                }
            }
        }

        // create options
        var options = {
            select: '_id info',
            // sort: { date: -1 },
            // populate: [{ path: 'role', select: "_id name" }],
            page: page,
            limit: 10
        };

        // get data
        Student.paginate(query, options).then(data => {
            if (!validate.isEmpty(data.docs)) {
                return res.status(200).send(msgRep.msgData(true, msg.msg_success, data));
            } else {
                return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
            }
        });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, error));
    }
})

//GET -- Get Role by ID
router.route('/getById').get((req, res) => {
    try {
        var id = req.query.id;
        Student.findOne({ _id: id, status: true })
            .populate({
                path: 'classes.class',
                select: "_id info.name info.room info.progress info.course",
                populate: {
                    path: 'info.course',
                    select: 'info.name'
                }
            }).exec((err, data) => {
                if (err) return res.status(500).send(msgRep.msgData(false, msg.msg_failed, err));
                return res.status(200).send(msgRep.msgData(true, msg.msg_success, data));
            })
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, error));
    }
})

//POST -- Create Student
router.route('/create').post((req, res) => {
    try {
        var student = new Student();
        student.info.name.firstName = req.body.firstName;
        student.info.name.lastName = req.body.lastName;
        student.info.birthday = req.body.birthday;
        student.info.address.street = req.body.street;
        student.info.address.block = req.body.block;
        student.info.address.district = req.body.district;
        student.info.phone = req.body.phone;
        student.info.governmentId = req.body.governmentId;
        student.createAt = time.getCurrentTime();
        student.updateAt = time.getCurrentTime();
        student.status = true;

        student.save((err) => {
            if (err) return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
            return res.status(200).send(msgRep.msgData(true, msg.msg_success, student));
        })
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

//PUT -- Update
router.route('/update').put((req, res) => {
    try {
        var id = req.body.id;
        var student = new Student();
        student.info.name.firstName = req.body.firstName;
        student.info.name.lastName = req.body.lastName;
        student.info.birthday = req.body.birthday;
        student.info.address.street = req.body.street;
        student.info.address.block = req.body.block;
        student.info.address.district = req.body.district;
        student.info.phone = req.body.phone;
        student.info.governmentId = req.body.governmentId;
        student.updateAt = time.getCurrentTime();

        Student.findOneAndUpdate(
            {
                _id: id,
                status: true
            },
            {
                $set:
                {
                    info: student.info,
                    updateAt: student.updateAt
                }
            },
            {
                upsert: true
            },
            (err, data) => {
                if (err) return res.status(500).send(msgRep.msgData(false, msg.msg_failed, err));
                return res.status(200).send(msgRep.msgData(true, msg.msg_success, data));
            });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

//PUT -- Delete
router.route('/delete').put((req, res) => {
    try {
        let id = req.body.id;
        let updateAt = time.getCurrentTime();

        Student.findOneAndUpdate(
            {
                _id: id,
                status: true
            },
            {
                $set:
                {
                    status: false,
                    updateAt: updateAt
                }
            },
            {
                upsert: true
            },
            (err, data) => {
                if (err) return res.status(500).send(msgRep.msgData(false, msg.msg_failed, err));
                return res.status(200).send(msgRep.msgData(true, msg.msg_success, data));
            });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

router.route('/connectToAccount').post((req, res) => {
    try {
        let connect = new Connect();
        let id = req.body.id;
        let accountId = req.body.accountId;

        console.log(accountId);

        Connect.findOne({ 'connect.student': id }).exec((error, data) => {
            if (error) {
                console.log(error);
                return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
            } else {
                if (validate.isEmpty(data)) {
                    connect.connect = {
                        account: accountId,
                        student: id
                    }
                    connect.createAt = new Date();
                    connect.updateAt = new Date();
                    connect.status = true;

                    console.log(connect);

                    connect.save((error) => {
                        if (error) {
                            console.log(error);
                            return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                        } else {
                            return res.status(200).send(msgRep.msgData(true, msg.msg_success));
                        }
                    });
                } else {
                    return res.status(200).send(msgRep.msgData(false, msg.msg_DUPLICATED));
                }
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
    }
});

router.route('/getAccountByUsername').get((req, res) => {
    try {
        let username = req.query.username;

        Account.findOne({ username: username, status: true }).select('username info').exec((error, data) => {
            if (error) {
                return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
            } else {
                if (validate.isEmpty(data)) {
                    return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
                } else {
                    return res.status(200).send(msgRep.msgData(true, msg.msg_success, data));
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

        Connect.findOne({ 'connect.student': id, status: true }).populate({ path: 'connect.account', select: 'username info' }).select('connect').exec((error, data) => {
            if (error) {
                return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
            } else {
                console.log(data);
                if (validate.isEmpty(data)) {
                    return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
                } else {
                    return res.status(200).send(msgRep.msgData(true, msg.msg_success, data));
                }
            }
        });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
    }
});

router.route('/disconnectAccount').post((req, res) => {
    try {
        let id = req.body.id;

        Connect.findOneAndRemove({ _id: id }).exec((error) => {
            if (error) return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
            return res.status(200).send(msgRep.msgData(true, msg.msg_success));
        });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
    }
});

module.exports = router;