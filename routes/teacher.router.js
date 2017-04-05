var express = require('express');
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
        })
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, error));
    }
})

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
        teacher.createAt = time.getCurrentTime();
        teacher.updateAt = time.getCurrentTime();
        teacher.status = true;

        Teacher.findOne({ 'info.governmentId': req.body.governmentId }).exec((err, data) => {
            if (validate.isEmpty(data)) {
                teacher.save((err) => {
                    if (err) return res.status(500).send(msgRep.msgData(false, msg.msg_failed, err));
                    return res.status(200).send(msgRep.msgData(true, msg.msg_success, teacher));
                })
            } else {
                return res.status(200).send(msgRep.msgData(false, msg.msg_teacher_exist));
            }
        })
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

module.exports = router;