var express = require('express');
var router = express.Router();

var Role = require('../model/role');
var Permission = require('../model/permission');

router.use(function (req, res, next) {
    console.log('permission_router is connecting');
    next();
});

//GET -- Get All Role
router.route('/getAll').get((req, res) => {
    Permission.find({}, (err, data) => {
        if (!err) {
            res.json({
                permissions: data
            });
        } else {
            return res.send(500, { error: err });
        }
    })
})

//POST
router.route('/permission/create').post((req, res) => {
    var data = new Permission();
    data.nameId = req.body.nameId;
    data.read = req.body.read;
    data.write = req.body.write;

    data.save((err) => {
        if (err) res.send(err)
        res.json({
            lul: data
        })
    })
});

module.exports = router;