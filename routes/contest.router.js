var express = require('express');
var router = express.Router();

var CMS = require('../model/cms');
var Comment = require('../model/comment');
var Account = require('../model/account');
var Student = require('../model/student');
var Topic = require('../model/topic');
var Contest = require('../model/contest');
var validationService = require('../_services/validation.service');
var messageService = require('../_services/message.service');
var timeService = require('../_services/time.service');
var time = new timeService.Time();
var validate = new validationService.Validation();
var msg = messageService.Message;
var msgRep = new messageService.Message();

var mail = require('../_services/mail.service');
var mailService = new Mail.MailService();

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
        Contest.paginate(query, options).then(data => {
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

        Contest.findOne({ _id: id, status: true }).exec((error, data) => {
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
        let contest = new Contest();
        contest.info.studentName = req.body.studentName || "";
        contest.info.parentName = req.body.parentName || "";
        contest.info.birthday = req.body.birthday;
        contest.info.email = req.body.email || "";
        contest.info.city = req.body.city || "";
        contest.info.phone = req.body.phone || "";
        contest.info.note = req.body.note || "";
        contest.process = req.body.process || "PENDING";
        contest.createAt = time.getCurrentTime();
        contest.updateAt = time.getCurrentTime();
        contest.status = true;

        contest.save((error) => {
            if (error) {
                return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
            }
            else {
                mailService.sendMail(contest.info.email, res);
            }
            // return res.status(200).send(msgRep.msgData(true, msg.msg_success));
        });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
    }
});

router.route('/update').put((req, res) => {
    try {
        let id = req.body.id;

        let contest = new Contest();
        contest.info.studentName = req.body.studentName || "";
        contest.info.parentName = req.body.parentName || "";
        contest.info.birthday = req.body.birthday;
        contest.info.email = req.body.email || "";
        contest.info.city = req.body.city || "";
        contest.info.phone = req.body.phone || "";
        contest.info.note = req.body.note || "";

        contest.process = req.body.process || "PENDING";
        contest.updateAt = time.getCurrentTime();

        Contest.findOneAndUpdate(
            {
                _id: id,
                status: true
            },
            {
                $set:
                {
                    info: contest.info,
                    process: contest.process,
                    updateAt: contest.updateAt
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

        Contest.findOneAndUpdate(
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
