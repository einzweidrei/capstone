var express = require('express');
var router = express.Router();

var Teacher = require('../model/teacher');
var Course = require('../model/course');
var Student = require('../model/student');
var Class = require('../model/class');
var Staff = require('../model/staff');
var validationService = require('../_services/validation.service');
var messageService = require('../_services/message.service');
var timeService = require('../_services/time.service');
var time = new timeService.Time();
var validate = new validationService.Validation();
var msg = messageService.Message;
var msgRep = new messageService.Message();

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
        Staff.paginate(query, options).then(data => {
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
// router.route('/getCourses').get((req, res) => {
//     try {
//         Course.find({}).select('_id info.name').exec((error, data) => {
//             if (error) return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
//             return res.status(200).send(msgRep.msgData(true, msg.msg_success, data));
//         });
//     } catch (error) {
//         return res.status(500).send(msgRep.msgData(false, error));
//     }
// });

router.route('/getById').get((req, res) => {
    try {
        var id = req.query.id;

        Staff.findOne({ _id: id }).exec((error, data) => {
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

//POST -- Create
router.route('/create').post((req, res) => {
    try {
        var staff = new Staff();
        staff.info.name.firstName = req.body.firstName;
        staff.info.name.lastName = req.body.lastName;
        staff.info.birthday = req.body.birthday;
        staff.info.address.street = req.body.street;
        staff.info.address.block = req.body.block;
        staff.info.address.district = req.body.district;
        staff.info.phone = req.body.phone;
        staff.info.governmentId = req.body.governmentId;
        staff.info.nationality = req.body.nationality;
        staff.createAt = time.getCurrentTime();
        staff.updateAt = time.getCurrentTime();
        staff.status = true;

        Staff.findOne({ 'info.governmentId': req.body.governmentId }).exec((err, data) => {
            if (validate.isEmpty(data)) {
                staff.save((err) => {
                    if (err) return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                    return res.status(200).send(msgRep.msgData(true, msg.msg_success));
                });
            } else {
                return res.status(200).send(msgRep.msgData(false, msg.msg_DUPLICATED));
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
        var staff = new Staff();
        staff.info.name.firstName = req.body.firstName;
        staff.info.name.lastName = req.body.lastName;
        staff.info.birthday = req.body.birthday;
        staff.info.address.street = req.body.street;
        staff.info.address.block = req.body.block;
        staff.info.address.district = req.body.district;
        staff.info.phone = req.body.phone;
        staff.info.governmentId = req.body.governmentId;
        staff.info.nationality = req.body.nationality;
        staff.updateAt = time.getCurrentTime();

        Staff.findOneAndUpdate(
            {
                _id: id,
                status: true
            },
            {
                $set:
                {
                    info: staff.info,
                    updateAt: staff.updateAt
                }
            },
            {
                upsert: true
            },
            (err, data) => {
                if (err) return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                return res.status(200).send(msgRep.msgData(true, msg.msg_success));
            });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
    }
});

//PUT -- Delete
router.route('/delete').put((req, res) => {
    try {
        var id = req.body.id;
        var updateAt = time.getCurrentTime();

        Staff.findOneAndUpdate(
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
                if (error) return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                return res.status(200).send(msgRep.msgData(true, msg.msg_success));
            });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
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

        Staff.findOneAndUpdate(
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

        Staff.findOneAndUpdate(
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
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
    }
});

module.exports = router;