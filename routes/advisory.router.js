var express = require('express');
var router = express.Router();

var CMS = require('../model/cms');
var Comment = require('../model/comment');
var Account = require('../model/account');
var Student = require('../model/student');
var Topic = require('../model/topic');
var Advisory = require('../model/advisory');

var validationService = require('../_services/validation.service');
var messageService = require('../_services/message.service');
var timeService = require('../_services/time.service');
var time = new timeService.Time();
var validate = new validationService.Validation();
var msg = messageService.Message;
var msgRep = new messageService.Message();

router.use(function (req, res, next) {
    console.log('contest_router is connecting');
    next();
});

router.route('/getAll').get((req, res) => {
    try {
        var page = req.query.page || 1;

        var studentName = req.query.studentName;
        var email = req.query.email;
        var phone = req.query.phone;
        var process = req.query.process;

        //create query
        var query = { status: true };

        if (studentName) query['info.studentName'] = new RegExp(studentName, 'i');
        if (email) query['info.email'] = new RegExp(email, 'i');
        if (phone) query['info.phone'] = new RegExp(phone, 'i');
        if (process) query['process'] = process;

        // create options
        var options = {
            select: '-status',
            sort: { 'updateAt.timestamp': 1 },
            // populate: [{ path: 'info.course', select: '_id info.name' }],
            page: page,
            limit: 10
        };

        // get data
        Advisory.paginate(query, options).then(data => {
            if (validate.isEmpty(data.docs)) {
                return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
            } else {
                return res.status(200).send(msgRep.msgData(true, msg.msg_success, data));
            }
        });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

router.route('/getById').get((req, res) => {
    try {
        var id = req.query.id;

        Advisory.findOne({ _id: id, status: true }).exec((error, data) => {
            if (error) {
                return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
            }
            else {
                if (validate.isEmpty(data)) {
                    return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
                } else {
                    return res.status(200).send(msgRep.msgData(true, msg.msg_success, data));
                }
            }
        })
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

router.route('/create').post((req, res) => {
    try {
        let advisory = new Advisory();
        advisory.info.studentName = req.body.studentName || "";
        advisory.info.parentName = req.body.parentName || "";
        advisory.info.birthday = req.body.birthday;
        advisory.info.email = req.body.email || "";
        advisory.info.city = req.body.city || "";
        advisory.info.phone = req.body.phone || "";
        advisory.info.note = req.body.note || "";
        advisory.process = req.body.process || "PENDING";
        advisory.createAt = time.getCurrentTime();
        advisory.updateAt = time.getCurrentTime();
        advisory.status = true;

        advisory.save((error) => {
            if (error) return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
            return res.status(200).send(msgRep.msgData(true, msg.msg_success));

        });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
    }
});

router.route('/update').put((req, res) => {
    try {
        let id = req.body.id;

        let advisory = new Advisory();
        advisory.info.studentName = req.body.studentName || "";
        advisory.info.parentName = req.body.parentName || "";
        advisory.info.birthday = req.body.birthday;
        advisory.info.email = req.body.email || "";
        advisory.info.city = req.body.city || "";
        advisory.info.phone = req.body.phone || "";
        advisory.info.note = req.body.note || "";

        advisory.process = req.body.process || "PENDING";
        advisory.updateAt = time.getCurrentTime();

        Advisory.findOneAndUpdate(
            {
                _id: id,
                status: true
            },
            {
                $set:
                {
                    info: advisory.info,
                    process: advisory.process,
                    updateAt: advisory.updateAt
                }
            },
            {
                upsert: true
            },
            (error) => {
                if (error) return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                return res.status(200).send(msgRep.msgData(true, msg.msg_success));
            }
        );
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
    }
});

router.route('/delete').put((req, res) => {
    try {
        let id = req.body.id;
        let updateAt = time.getCurrentTime();

        Advisory.findOneAndUpdate(
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
            (error) => {
                if (error) return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                return res.status(200).send(msgRep.msgData(true, msg.msg_success));
            }
        );
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
    }
});

module.exports = router;
