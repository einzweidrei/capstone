var nodemailer = require('nodemailer');
var messageService = require('../_services/message.service');
var msgRep = new messageService.Message();

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'YukoTesting01@gmail.com',
        pass: '789632145'
    }
});

var MailService = (function () {
    function MailService() { }

    MailService.prototype.sendMail = (email, res) => {
        try {
            // setup email data with unicode symbols
            let mailOptions = {
                from: '"Admin" <YukoTesting01@gmail.com>', // sender address
                to: email, // list of receivers
                subject: 'Register IELTS confirmed', // Subject line
                text: 'Your request to register IELTS is successul!', // plain text body
                // html: '<b>Test HTML</b>' // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
                return res.status(200).send(msgRep.msgData(true, msg.msg_success));
            });
        } catch (error) {
            return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
        }
    };

    MailService.prototype.resetPassword = (email, newPw, res) => {
        try {
            // setup email data with unicode symbols
            let mailOptions = {
                from: '"Admin" <YukoTesting01@gmail.com>', // sender address
                to: email, // list of receivers
                subject: 'Reset your password', // Subject line
                text: 'Your new password: ' + newPw, // plain text body
                // html: '<b>Test HTML</b>' // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                }
                // console.log('Message %s sent: %s', info.messageId, info.response);
                return res.status(200).send(msgRep.msgData(true, msg.msg_success));
            });
        } catch (error) {
            return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
        }
    };

    return MailService;
}());

exports.MailService = MailService;
