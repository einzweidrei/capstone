var express = require('express');
var router = express.Router();

var CMS = require('../model/cms');
var Comment = require('../model/comment');
var Account = require('../model/account');
var Student = require('../model/student');
var Topic = require('../model/topic');
var validationService = require('../_services/validation.service');
var messageService = require('../_services/message.service');
var timeService = require('../_services/time.service');
var time = new timeService.Time();
var validate = new validationService.Validation();
var msg = messageService.Message;
var msgRep = new messageService.Message();

router.use(function (req, res, next) {
    console.log('topic_router is connecting');
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
        var query = { status: true };

        var title = req.query.title;
        var type = req.query.type;
        var priority = req.query.priority;
        // var timeStart = req.query.timeStart;
        // var timeEnd = req.query.timeEnd;

        // var day = {};
        // var month = {};
        // var year = {};

        // if (timeStart) {
        //     var timing = time.parseTimetoObject(timeStart);
        //     day['$gte'] = timing.day;
        //     month['$gte'] = timing.month;
        //     year['$gte'] = timing.year;
        // }
        // if (timeEnd) {
        //     var timing = time.parseTimetoObject(timeEnd);
        //     day['$lte'] = timing.day;
        //     month['$lte'] = timing.month;
        //     year['$lte'] = timing.year;
        // }

        if (!page) page = 1;
        if (title) query['info.title'] = new RegExp(title, 'i');
        if (type) query['info.type'] = type;
        if (priority) query['info.priority'] = priority;
        // if (timeStart || timeEnd) {
        //     query['createAt.day'] = day;
        //     query['createAt.month'] = month;
        // }

        // create options
        var options = {
            select: '_id info process createAt updateAt',
            sort: {
                'createAt.timestamp': -1
            },
            // populate: [{ path: 'role', select: "_id name" }],
            page: page,
            limit: 10
        };

        // get data
        Topic.paginate(query, options).then(data => {
            if (validate.isEmpty(data.docs)) return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
            return res.status(200).send(msgRep.msgData(true, msg.msg_success, data));
        });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, error));
    }
});

//GET -- Get by ID
router.route('/getById').get((req, res) => {
    try {
        var id = req.query.id;
        if (!id) id = "";

        var selectQuery = "_id info process createAt updateAt";
        Topic.findOne({ _id: id, status: true }).select(selectQuery).exec((error, data) => {
            if (error) return res.status(500).send(msgRep.msgData(false, error));
            return res.status(200).send(msgRep.msgData(true, msg.msg_success, data));
        })
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, error));
    }
});

router.route('/getComment').get((req, res) => {
    try {
        var id = req.query.id;
        var page = req.query.page;
        var limit = req.query.limit;

        if (!page) page = 1;
        if (!limit) limit = 10;

        page = page - 1;
        var skip = page * limit;

        Topic.findOne({ _id: id }, { comments: { $slice: [skip, limit] } }, (error, data) => {
            if (error) {
                return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
            } else {
                if (validate.isEmpty(data)) {
                    return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
                } else {
                    Account.populate(data, { path: 'comments.author', select: '_id info' }, (err, populateData) => {
                        return res.status(200).send(msgRep.msgData(true, msg.msg_success, populateData));
                    });
                }
            }
        });
    }
    catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
    }
});

//POST -- Create
router.route('/create').post((req, res) => {
    try {
        var topic = new Topic();
        topic.info.title = req.body.title;
        topic.info.type = req.body.type;
        topic.info.priority = req.body.priority;
        topic.info.author = req.body.author;
        topic.info.process = "PENDING";

        var comment = {
            author: req.body.author,
            content: req.body.content,
            createAt: time.getCurrentTime(),
            updateAt: time.getCurrentTime(),
            status: true
        };

        topic.comments.push(comment);
        topic.createAt = time.getCurrentTime();
        topic.updateAt = time.getCurrentTime();
        topic.status = true;

        var comment = new Comment();
        comment.info.content = req.body.content;
        comment.info.author = req.body.author;
        comment.createAt = time.getCurrentTime();
        comment.updateAt = time.getCurrentTime();
        comment.status = true;

        Account.findOne({ _id: req.body.author }).exec((error, data) => {
            if (error) {
                return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
            } else {
                if (validate.isEmpty(data)) {
                    return res.status(200).send(msgRep.msgData(false, msg.msg_account_notExist));
                } else {
                    topic.save((err) => {
                        if (err) return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                        return res.status(200).send(msgRep.msgData(true, msg.msg_success, topic));
                    })
                }
            }
        });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

//POST -- Comment
router.route('/comment').post((req, res) => {
    try {
        var id = req.body.id;

        var comment = {
            author: req.body.author,
            content: req.body.content,
            createAt: time.getCurrentTime(),
            updateAt: time.getCurrentTime(),
            status: true
        };

        Topic.findOneAndUpdate(
            {
                _id: id,
                status: true
            },
            {
                $push:
                {
                    comments: comment
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
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

//PUT -- Delete
router.route('/delete').put((req, res) => {
    try {
        var id = req.body.id;
        var updateAt = time.getCurrentTime();

        CMS.findOneAndUpdate(
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
