var express = require('express');
var router = express.Router();

var Role = require('../model/role');
var Permission = require('../model/permission');
var Function = require('../model/function');

router.use(function (req, res, next) {
    console.log('router_role is connecting');
    next();
});

//GET -- Get All Role
router.route('/getAll').get((req, res) => {
    Backend_function.find({}, (err, data) => {
        if (!err) {
            res.json({
                functions: data
            });
        } else {
            return res.send(500, { error: err });
        }
    })
})

//GET -- Get All Role
router.route('/getFuncbyType').get((req, res) => {
    var type = req.query.type;
    Function.find({ type: type }, (err, func) => {
        return res.json({
            status: true,
            message: 'success',
            functions: func
        });
    })
})

//POST
router.route('/create').post((req, res) => {
    var data = new Function();
    data.nameId = req.body.nameId;
    data.type = req.body.type;

    data.save((err) => {
        if (err) res.send(err)
        res.json({
            data: data
        })
    })
});

module.exports = router;