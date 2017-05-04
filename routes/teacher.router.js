var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var Teacher = require('../model/teacher');
var Course = require('../model/course');
var Student = require('../model/student');
var Class = require('../model/class');
var validationService = require('../_services/validation.service');
var messageService = require('../_services/message.service');
var timeService = require('../_services/time.service');
var time = new timeService.Time();
var validate = new validationService.Validation();
var msg = messageService.Message;
var msgRep = new messageService.Message();

var ObjectId = mongoose.Types.ObjectId;

router.use(function (req, res, next) {
    console.log('class_router is connecting');
    next();
});

function checkIsValid(item) {
    if (typeof item === 'undefined' || item === null || item === '') {
        return false;
    }
    return true;
}

//GET -- Get All
router.route('/getAll').get((req, res) => {
    try {
        var page = req.query.page;
        var firstName = req.query.firstName;
        var lastName = req.query.lastName;
        var query = { status: true };

        if (!page) page === 1;
        if (firstName) query['info.name.firstName'] = firstName;
        if (lastName) query['info.name.lastName'] = lastName;

        // create options
        var options = {
            select: '_id info',
            // sort: { date: -1 },
            // populate: [{ path: 'role', select: "_id name" }],
            page: page,
            limit: 10
        };

        // get data
        Teacher.paginate(query, options).then(data => {
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

//GET -- Get All
router.route('/getCourses').get((req, res) => {
    try {
        Course.find({}).select('_id info.name').exec((error, data) => {
            if (error) return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
            return res.status(200).send(msgRep.msgData(true, msg.msg_success, data));
        });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, error));
    }
});

router.route('/getById').get((req, res) => {
    try {
        var id = req.query.id;

        Teacher.findOne({ _id: id, status: true }).populate(
            {
                path: 'classes.class',
                select: "_id info.name info.room info.progress info.course",
                populate: {
                    path: 'info.course',
                    select: 'info.name'
                }
            }
        ).exec((error, data) => {
            if (error) {
                return res.status(500).send(msgRep.msgData(false, error));
            } else {
                if (validate.isEmpty(data)) {
                    return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
                } else {
                    return res.status(200).send(msgRep.msgData(true, msg.msg_success, data));
                }
            }
        });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, error));
    }
});

router.route('/addAttendance').post((req, res) => {
    try {
        var id = req.body.id;

        var attendance = {
            note: req.body.note || "",
            date: req.body.date,
            status: true
        }

        Teacher.findOneAndUpdate(
            {
                _id: id,
                status: true
            },
            {
                $push: {
                    attendances: attendance
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
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
    }
});

router.route('/deleteAttendance').put((req, res) => {
    try {
        var id = req.body.id;
        var attendanceId = req.body.attendanceId;

        Teacher.findOneAndUpdate(
            {
                _id: id,
                status: true
            },
            {
                $pull: {
                    attendances: {
                        _id: ObjectId(attendanceId)
                    }
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
    } catch (error) {
        console.log(error);
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
    }
});

//POST -- Create
router.route('/create').post((req, res) => {
    try {
        var teacher = new Teacher();
        teacher.info.name.firstName = req.body.firstName;
        teacher.info.name.lastName = req.body.lastName;
        teacher.info.birthday = req.body.birthday;
        teacher.info.address.street = req.body.street;
        teacher.info.address.block = req.body.block;
        teacher.info.address.district = req.body.district;
        teacher.info.phone = req.body.phone;
        teacher.info.governmentId = req.body.governmentId;
        teacher.info.nationality = req.body.nationality;
        teacher.info.certification = req.body.certification;
        teacher.createAt = time.getCurrentTime();
        teacher.updateAt = time.getCurrentTime();
        teacher.status = true;

        Teacher.findOne({ 'info.governmentId': req.body.governmentId }).exec((err, data) => {
            if (validate.isEmpty(data)) {
                teacher.save((err) => {
                    if (err) return res.status(500).send(msgRep.msgData(false, msg.msg_failed, err));
                    return res.status(200).send(msgRep.msgData(true, msg.msg_success, teacher));
                });
            } else {
                return res.status(200).send(msgRep.msgData(false, msg.msg_teacher_exist));
            }
        });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

//PUT -- Update
router.route('/update').put((req, res) => {
    try {
        var id = req.body.id;
        var teacher = new Teacher();
        teacher.info.name.firstName = req.body.firstName;
        teacher.info.name.lastName = req.body.lastName;
        teacher.info.birthday = req.body.birthday;
        teacher.info.address.street = req.body.street;
        teacher.info.address.block = req.body.block;
        teacher.info.address.district = req.body.district;
        teacher.info.phone = req.body.phone;
        teacher.info.governmentId = req.body.governmentId;
        teacher.info.nationality = req.body.nationality;
        teacher.info.certification = req.body.certification;
        teacher.updateAt = time.getCurrentTime();

        Teacher.findOneAndUpdate(
            {
                _id: id,
                status: true
            },
            {
                $set:
                {
                    info: teacher.info,
                    updateAt: teacher.updateAt
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
        var id = req.body.id;
        var updateAt = time.getCurrentTime();

        Teacher.findOneAndUpdate(
            {
                _id: id,
                status: true
            },
            {
                $set:
                {
                    updateAt: updateAt,
                    status: false
                }
            },
            {
                upsert: true
            },
            (error, data) => {
                if (error) return res.status(500).send(msgRep.msgData(false, error));
                return res.status(200).send(msgRep.msgData(true, msg.msg_success));
            });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});
module.exports = router;