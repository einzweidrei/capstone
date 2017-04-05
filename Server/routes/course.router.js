var express = require('express');
var router = express.Router();

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

//GET -- Get All Students
router.route('/getAll').get((req, res) => {
    try {
        var page = req.query.page;
        var name = req.query.name;

        // create query
        var query = { 'info.name': name, status: true };
        if (!page) page === 1;
        if (!name) query = { status: true };

        // create options
        var options = {
            select: '_id info',
            // sort: { date: -1 },
            // populate: [{ path: 'role', select: "_id name" }],
            page: page,
            limit: 10
        };

        // get data
        Course.paginate(query, options).then(data => {
            if (!validate.isEmpty(data.docs)) {
                return res.status(200).send(msgRep.msgData(true, msg.msg_success, data));
            } else {
                return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
            }
        });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
})

//GET -- Get All Courses
router.route('/getCourses').get((req, res) => {
    try {
        Course.find({}).select('_id info.name').exec((error, data) => {
            if (error) return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
            return res.status(200).send(msgRep.msgData(true, msg.msg_success, data));
        })
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
})

//POST -- Create Course
router.route('/create').post((req, res) => {
    try {
        var course = new Course();
        course.info.name = req.body.name;
        course.info.time.startAt = req.body.startAt;
        course.info.time.endAt = req.body.endAt;
        course.createAt = time.getCurrentTime();
        course.status = true;

        Course.findOne({ 'info.name': req.body.name }).exec((err, data) => {
            if (data !== null) {
                return res.status(200).send(msgRep.msgData(false, msg.msg_course_exist));
            } else {
                course.save((err) => {
                    if (err) return res.status(500).send(msgRep.msgData(false, msg.msg_failed, err));
                    return res.status(200).send(msgRep.msgData(true, msg.msg_success, course));
                })
            }
        })
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

module.exports = router;