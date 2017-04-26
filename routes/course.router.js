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

//GET
router.route('/getAll').get((req, res) => {
    try {
        var page = req.query.page;
        var name = req.query.name;

        // create query
        var query = { status: true };
        if (!page) page === 1;
        if (name) query['info.name'] = new RegExp(name, 'i');;

        // create options
        var options = {
            // select: '_id info.name info.tuitionFees',
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

//GET -- Get 
router.route('/getById').get((req, res) => {
    try {
        var id = req.query.id || [];
        Course.findOne({ _id: id }).select('_id info').exec((error, data) => {
            if (error) {
                return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
            } else {
                if (validate.isEmpty(data)) {
                    return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
                } else {
                    return res.status(200).send(msgRep.msgData(true, msg.msg_success, data));
                }
            }
        })
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
    }
});

//POST -- Create Course
router.route('/create').post((req, res) => {
    try {
        console.log(req.body);

        var course = new Course();
        course.info.name = req.body.name;
        course.info.tuitionFees = req.body.tuitionFees;
        course.info.routerLink = req.body.routerLink;
        course.info.summary = req.body.summary;
        course.info.content = req.body.content;
        course.info.image = req.body.image;
        course.info.status = req.body.status;
        course.createAt = time.getCurrentTime();
        course.updateAt = time.getCurrentTime();
        course.status = true;

        Course.findOne({ 'info.name': req.body.name }).exec((error, data) => {
            if (error) {
                return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
            } else {
                if (validate.isEmpty(data)) {
                    course.save((err) => {
                        if (err) return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                        return res.status(200).send(msgRep.msgData(true, msg.msg_success));
                    })
                } else {
                    return res.status(200).send(msgRep.msgData(false, msg.msg_course_exist));
                }
            }
        })
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, error));
    }
});

//PUT -- Update
router.route('/update').put((req, res) => {
    try {
        var id = req.body.id;
        var course = new Course();
        course.info.name = req.body.name;
        course.info.tuitionFees = req.body.tuitionFees;
        course.info.routerLink = req.body.routerLink;
        course.info.summary = req.body.summary;
        course.info.content = req.body.content;
        course.info.image = req.body.image;
        course.info.status = req.body.status;
        course.updateAt = time.getCurrentTime();

        Course.findOneAndUpdate(
            {
                _id: id,
                status: true
            },
            {
                $set:
                {
                    info: course.info,
                    updateAt: course.updateAt
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

//PUT -- Update
router.route('/delete').put((req, res) => {
    try {
        var id = req.body.id;
        course.updateAt = time.getCurrentTime();

        Course.findOneAndUpdate(
            {
                _id: id,
                status: true
            },
            {
                $set:
                {
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