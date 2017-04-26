var express = require('express');
var router = express.Router();

var CMS = require('../model/cms');
var Student = require('../model/student');
var validationService = require('../_services/validation.service');
var messageService = require('../_services/message.service');
var timeService = require('../_services/time.service');
var time = new timeService.Time();
var validate = new validationService.Validation();
var msg = messageService.Message;
var msgRep = new messageService.Message();

router.use(function (req, res, next) {
    console.log('cms_router is connecting');
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
        var timeStart = req.query.timeStart;
        var timeEnd = req.query.timeEnd;

        var day = {};
        var month = {};
        var year = {};

        if (timeStart) {
            var timing = time.parseTimetoObject(timeStart);
            day['$gte'] = timing.day;
            month['$gte'] = timing.month;
            year['$gte'] = timing.year;
        }
        if (timeEnd) {
            var timing = time.parseTimetoObject(timeEnd);
            day['$lte'] = timing.day;
            month['$lte'] = timing.month;
            year['$lte'] = timing.year;
        }

        if (!page) page = 1;
        if (title) query['info.title'] = new RegExp(title, 'i');
        if (type) query['info.type'] = type;
        if (priority) query['info.priority'] = priority;
        if (timeStart || timeEnd) {
            query['createAt.day'] = day;
            query['createAt.month'] = month;
        }

        // create options
        var options = {
            select: '_id info createAt updateAt',
            sort: {
                'createAt.timestamp': -1
            },
            // populate: [{ path: 'role', select: "_id name" }],
            page: page,
            limit: 10
        };

        // get data
        CMS.paginate(query, options).then(data => {
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

        var selectQuery = "_id info createAt updateAt";
        CMS.findOne({ _id: id, status: true }).select(selectQuery).exec((error, data) => {
            if (error) return res.status(500).send(msgRep.msgData(false, error));
            return res.status(200).send(msgRep.msgData(true, msg.msg_success, data));
        })
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, error));
    }
});

//POST -- Create
router.route('/create').post((req, res) => {
    try {
        var cms = new CMS();
        cms.info.title = req.body.title;
        cms.info.type = req.body.type;
        cms.info.priority = req.body.priority;
        cms.info.summary = req.body.summary;
        cms.info.imgUrl = req.body.imgUrl;
        cms.info.routerLink = req.body.routerLink;
        cms.info.content = req.body.content;
        cms.info.status = req.body.status;
        cms.createAt = time.getCurrentTime();
        cms.updateAt = time.getCurrentTime();
        cms.status = true;

        cms.save((err) => {
            if (err) return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
            return res.status(200).send(msgRep.msgData(true, msg.msg_success, cms));
        })
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

//PUT -- Update
router.route('/update').put((req, res) => {
    try {
        var id = req.body.id;
        var cms = new CMS();
        cms.info.title = req.body.title;
        cms.info.type = req.body.type;
        cms.info.priority = req.body.priority;
        cms.info.summary = req.body.summary;
        cms.info.imgUrl = req.body.imgUrl;
        cms.info.routerLink = req.body.routerLink;
        cms.info.content = req.body.content;
        cms.info.status = req.body.status;
        cms.updateAt = time.getCurrentTime();

        CMS.findOneAndUpdate(
            {
                _id: id,
                status: true
            },
            {
                $set:
                {
                    info: cms.info,
                    updateAt: cms.updateAt
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
