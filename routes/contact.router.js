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



module.exports = router;
