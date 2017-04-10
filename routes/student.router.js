var express = require('express');
var router = express.Router();

var Student = require('../model/student');
var validationService = require('../_services/validation.service');
var messageService = require('../_services/message.service');
var timeService = require('../_services/time.service');
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

module.exports = router;