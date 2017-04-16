var express = require('express');
var router = express.Router();

var Account = require('../model/account');
var Role = require('../model/role');
var Permission = require('../model/permission');
var Function = require('../model/function');

var validationService = require('../_services/validation.service');
var messageService = require('../_services/message.service');
var validate = new validationService.Validation();
var msg = messageService.Message;
var msgRep = new messageService.Message();

router.use(function (req, res, next) {
    console.log('router_role is connecting');
    next();
});

//GET -- Get All Role
router.route('/getAll').get((req, res) => {
    Role.find({ status: true }).select('_id name').exec((err, data) => {
        if (!err) {
            res.json({
                status: true,
                roles: data
            });
        } else {
            return res.send(500, { message: err });
        }
    })
})

//GET -- Get Role by ID
router.route('/getRolebyId').get((req, res) => {
    var roleId = req.query.id;
    Role.findOne({ _id: roleId, status: true }).exec((err, roles) => {
        if (!err) {
            return res.json({
                status: true,
                message: msg.msg_success,
                data: roles
            });

        } else {

        }
    })
})

//POST -- Get Permission
router.route('/getPerm').post((req, res) => {
    var accountId = req.body.accountId;
    var permName = req.body.permName;

    Account.findOne({ _id: accountId }).exec((err, account) => {
        if (!err) {
            if (account !== null) {
                for (var i = 0; i < account.roleTest.backend_func.length; i++) {
                    if (account.roleTest.backend_func[i].name === permName) {
                        var result = { backend: account.roleTest.backend, data: account.roleTest.backend_func[i], status: true, message: msg.msg_success };
                        return res.send(result);
                    }
                }
                // Role
                //     .findOne({ _id: account.role })
                //     .select('backend backend_func')
                //     .populate([{ path: 'backend_func', select: "read create update delete" }]).exec((err, data) => {
                //         if (!err) {
                //             if (data !== null) {
                //                 for (var i = 0; i < data.backend_func.length; i++) {
                //                     if (data.backend_func[i].name === permName) {
                //                         var result = { backend: data.backend, data: data.backend_func[i], status: true, message: msg.msg_success };
                //                         return res.send(result);
                //                     }
                //                 }
                //             } else {
                //                 //data null
                //             }
                //         } else {
                //             return res.send(msgRep.msgFailedOut(false, err));
                //         }
                //     })
            } else {
                return res.send(msgRep.msgFailedOut(false, msg.msg_account_notExist));
            }
        } else {
            return res.send(500, { message: err });
        }
    })
})

//POST
router.route('/create').post((req, res) => {
    var data = new Role();
    data.name = req.body.name;
    data.backend_func = req.body.backend_func;
    data.frontend_func = req.body.frontend_func;
    data.backend = req.body.backend;
    data.status = true;

    //validate 
    var error = data.validateSync();

    //invalid
    if (error) {
        return res.json({
            error: error.errors,
            status: false,
            message: msg.msg_failed
        });
    }

    data.save((err) => {
        if (err) res.send(err)
        res.json({
            status: true,
            data: data
        })
    })
});

//PUT -- Update
router.route('/update').put((req, res) => {
    var id = req.body.id;
    var data = new Role();
    data.name = req.body.name;
    data.backend_func = req.body.backend_func;
    data.frontend_func = req.body.frontend_func;
    data.backend = req.body.backend;

    if (typeof id === "undefined" || id === null) {
        return res.json({
            status: false,
            message: msg.msg_failed
        })
    }

    //validate 
    var error = data.validateSync();

    //invalid
    if (error) {
        return res.json({
            error: error.errors,
            status: false,
            message: msg.msg_failed
        });
    }

    // console.log(id);
    Role.findOneAndUpdate(
        {
            _id: id,
            status: true
        },
        {
            $set:
            {
                name: data.name,
                frontend_func: data.frontend_func,
                backend_func: data.backend_func,
                backend: data.backend
            }
        },
        {
            upsert: true
        },
        (err, role) => {
            if (!err) {
                res.json({
                    status: true,
                    message: msg.msg_success
                });
            } else {
                return res.json({
                    status: false,
                    message: msg.msg_failed
                })
            }
        });
});

//PUT - Delete Role
router.route('/delete').put((req, res) => {
    var id = req.body.id;

    if (typeof id === "undefined") {
        return res.json({
            status: false,
            message: msg.msg_failed
        })
    }

    Role.findOneAndUpdate(
        {
            _id: id
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
        (err, role) => {
            if (!err) {
                res.json({
                    status: true,
                    message: msg.msg_success
                });
            } else {
                return res.json({
                    status: false,
                    message: msg.msg_failed
                })
            }
        });
});

module.exports = router;