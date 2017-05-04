var express = require('express');
var router = express.Router();

var Teacher = require('../model/teacher');
var Student = require('../model/student');
var Class = require('../model/class');
var validationService = require('../_services/validation.service');
var messageService = require('../_services/message.service');
var timeService = require('../_services/time.service');
var time = new timeService.Time();
var validate = new validationService.Validation();
var msg = messageService.Message;
var msgRep = new messageService.Message();

var ObjectId = require('mongoose').Types.ObjectId;

router.use(function (req, res, next) {
    console.log('class_router is connecting');
    next();
});

//GET -- Get All
router.route('/getAll').get((req, res) => {
    try {
        var page = req.query.page || 1;

        var className = req.query.name;
        var room = req.query.room;

        //create query
        var query = { status: true };

        if (className) query['info.name'] = new RegExp(className, 'i');
        if (room) query['info.room'] = new RegExp(room, 'i');

        // create options
        var options = {
            select: '_id info',
            // sort: { date: -1 },
            populate: [{ path: 'info.course', select: '_id info.name' }],
            page: page,
            limit: 10
        };

        // get data
        Class.paginate(query, options).then(data => {
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

        var populateQuery = [
            { path: 'students.student', select: '_id info' },
            { path: 'teachers.teacher', select: '_id info' }
        ]

        var selectQuery = '_id staff students teachers attendances info';

        Class.findOne({ _id: id, status: true }).select(selectQuery).populate(populateQuery).exec((err, data) => {
            if (err) {
                return res.status(500).send(msgRep.msgData(false, msg.msg_failed, err));
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
        return res.status(500).send(msgRep.msgData(false, error));
    }
})

router.route('/getClasses').get((req, res) => {
    try {
        var course = req.query.course || [];
        var progress = req.query.progress || [];

        var query = { 'info.course': course, 'info.progress': progress };
        var selectQuery = '_id info';
        var populateQuery = [
            { path: 'info.course', select: '_id info' },
        ];

        Class.find(query).select(selectQuery).populate(populateQuery).exec((error, data) => {
            if (error) {
                return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
            } else {
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

router.route('/getAttendanceById').get((req, res) => {
    try {
        var classId = req.query.classId || [];
        var attendanceId = req.query.attendanceId || [];

        Class
            .aggregate([
                {
                    $unwind: { path: "$attendances", preserveNullAndEmptyArrays: true }
                },
                {
                    $match:
                    {
                        _id: new ObjectId(classId),
                        'attendances._id': new ObjectId(attendanceId)
                    }
                },
                {
                    $project:
                    {
                        _id: 1,
                        attendances: 1,
                        students: 1
                    }
                }
            ])
            .exec((err, data) => {
                if (err) {
                    return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                }
                else {
                    if (validate.isEmpty(data)) {
                        return res.status(200).send(msgRep.msgData(false, msg.msg_data_not_exist));
                    } else {
                        Student.populate(data, { path: 'students.student attendances.students.student', select: '_id info' }, (err, populateData) => {
                            return res.status(200).send(msgRep.msgData(true, msg.msg_success, populateData[0]));
                        })
                    }
                }
            })
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, error));
    }
});

//PUT
router.route('/updateAttendance').put((req, res) => {
    try {
        var classId = req.body.classId || [];
        var attendanceId = req.body.attendanceId || [];

        var studentNumber = req.body.studentNumber;
        var date = req.body.date;
        var students = req.body.students;

        var updateAt = time.getCurrentTime();

        Class.findOne(
            {
                _id: classId
            }
        ).exec((error, data) => {
            if (error) {
                return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
            }
            else {
                if (validate.isEmpty(data)) {
                    return res.status(200).send(msgRep.msgData(false, "Data is empty"));
                } else {
                    data.attendances.id(attendanceId).date = date;
                    data.attendances.id(attendanceId).students = students;
                    data.attendances.id(attendanceId).studentNumber = studentNumber;
                    data.updateAt = updateAt;
                    data.save();
                    return res.status(200).send(msgRep.msgData(true, msg.msg_success));
                }
            }
        });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

//POST -- Create
router.route('/create').post((req, res) => {
    try {
        var classRoom = new Class();
        classRoom.info.name = req.body.name;
        classRoom.info.time = req.body.time;
        classRoom.info.room = req.body.room;
        classRoom.info.studentNumber = 0;
        classRoom.info.teacherNumber = 0;
        classRoom.info.course = req.body.course;
        classRoom.info.progress = req.body.progress;
        classRoom.info.startAt = req.body.startAt;
        classRoom.createAt = time.getCurrentTime();
        classRoom.updateAt = time.getCurrentTime();
        classRoom.status = true;

        classRoom.save((err) => {
            if (err) return res.status(500).send(msgRep.msgData(false, msg.msg_failed, err));
            return res.status(200).send(msgRep.msgData(true, msg.msg_success, classRoom));
        })
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

//PUT
router.route('/update').put((req, res) => {
    try {
        var classId = req.body.id || [];
        var name = req.body.name || [];
        var room = req.body.room || [];
        var course = req.body.course || [];
        var startAt = req.body.startAt || [];
        var timeClass = req.body.time || [];
        var progress = req.body.progress || [];

        var updateAt = time.getCurrentTime();

        Class.findOne(
            {
                _id: classId,
                status: true
            }
        ).exec((error, data) => {
            if (error) {
                return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
            }
            else {
                if (validate.isEmpty(data)) {
                    return res.status(200).send(msgRep.msgData(false, "Data is empty"));
                } else {
                    Class.findOneAndUpdate(
                        {
                            _id: classId,
                            status: true
                        },
                        {
                            $set:
                            {
                                'info.name': name,
                                'info.room': room,
                                'info.course': course,
                                'info.time': timeClass,
                                'info.progress': progress,
                                'info.startAt': startAt,
                                updateAt: updateAt
                            }
                        },
                        (error, data) => {
                            if (error) {
                                return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                            }
                            else {
                                return res.status(200).send(msgRep.msgData(true, msg.msg_success));
                            }
                        }
                    )
                }
            }
        });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

//PUT
router.route('/delete').put((req, res) => {
    try {
        var classId = req.body.id || [];
        var updateAt = time.getCurrentTime();

        Class.findOne(
            {
                _id: classId,
                status: true
            }
        ).exec((error, data) => {
            if (error) {
                return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
            }
            else {
                if (validate.isEmpty(data)) {
                    return res.status(200).send(msgRep.msgData(false, "Data is empty"));
                } else {
                    Class.findOneAndUpdate(
                        {
                            _id: classId,
                            status: true
                        },
                        {
                            $set:
                            {
                                status: false,
                                updateAt: updateAt
                            }
                        },
                        (error, data) => {
                            if (error) {
                                return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                            }
                            else {
                                return res.status(200).send(msgRep.msgData(true, msg.msg_success));
                            }
                        }
                    )
                }
            }
        });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

//PUT
router.route('/updateStudent').put((req, res) => {
    try {
        var classRoom = new Class();
        var classId = req.body.classId;
        var studentId = req.body.studentId;
        var student = {
            student: studentId,
            score: {
                midterm: 0,
                finalexam: 0
            }
        };

        var updateAt = time.getCurrentTime();

        Class.findOne(
            {
                _id: classId
            }
        ).exec((error, data) => {
            if (error) {
                return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
            }
            else {
                if (validate.isEmpty(data)) {
                    return res.status(200).send(msgRep.msgData(false, "Data is empty"));
                } else {
                    for (var i = 0; i < data.students.length; i++) {
                        if (data.students[i].student == studentId) {
                            return res.status(200).send(msgRep.msgData(false, "Student exists"));
                        }
                    }

                    Class.findOneAndUpdate(
                        {
                            _id: classId
                        },
                        {
                            $set:
                            {
                                updateAt: updateAt
                            },
                            $push:
                            {
                                students: student
                            }
                        },
                        (error, data) => {
                            if (error) {
                                return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
                            }
                            else {
                                var objClass = { class: classId };
                                Student.findOneAndUpdate(
                                    {
                                        _id: studentId
                                    },
                                    {
                                        $set:
                                        {
                                            updateAt: updateAt
                                        },
                                        $push:
                                        {
                                            classes: objClass
                                        }
                                    },
                                    (error, data) => {
                                        if (error) return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
                                        return res.status(200).send(msgRep.msgData(true, msg.msg_success));
                                    }
                                )
                            }
                        }
                    );
                }
            }
        });

    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

//PUT
router.route('/deleteStudent').put((req, res) => {
    try {
        var classRoom = new Class();
        var classId = req.body.classId;
        var studentId = req.body.studentId;
        var updateAt = time.getCurrentTime();

        Class.findOneAndUpdate(
            {
                _id: classId
            },
            {
                $pull:
                {
                    students:
                    {
                        student: studentId
                    }
                }
            },
            (error, data) => {
                if (error) {
                    return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
                } else {
                    Student.findOneAndUpdate(
                        {
                            _id: studentId
                        },
                        {
                            $pull:
                            {
                                classes:
                                {
                                    class: classId
                                }
                            }
                        },
                        (error, data) => {
                            if (error) return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
                            return res.status(200).send(msgRep.msgData(true, msg.msg_success));
                        }
                    )
                }
            })
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

//PUT
router.route('/updateTeacher').put((req, res) => {
    try {
        var classRoom = new Class();
        var classId = req.body.classId;
        var teacherId = req.body.teacherId;
        var teacher = { teacher: teacherId };
        var updateAt = time.getCurrentTime();

        Class.findOne(
            {
                _id: classId
            }
        ).exec((error, data) => {
            if (error) {
                return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
            }
            else {
                if (validate.isEmpty(data)) {
                    return res.status(200).send(msgRep.msgData(false, "Data is empty"));
                } else {
                    for (var i = 0; i < data.teachers.length; i++) {
                        if (data.teachers[i].teacher == teacherId) {
                            return res.status(200).send(msgRep.msgData(false, "Teacher exists"));
                        }
                    }

                    Class.findOneAndUpdate(
                        {
                            _id: classId
                        },
                        {
                            $set:
                            {
                                updateAt: updateAt
                            },
                            $push:
                            {
                                teachers: teacher
                            }
                        },
                        (error, data) => {
                            if (error) {
                                return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
                            }
                            else {
                                var objClass = { class: classId };
                                Teacher.findOneAndUpdate(
                                    {
                                        _id: teacherId
                                    },
                                    {
                                        $set:
                                        {
                                            updateAt: updateAt
                                        },
                                        $push:
                                        {
                                            classes: objClass
                                        }
                                    },
                                    (error, data) => {
                                        if (error) return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
                                        return res.status(200).send(msgRep.msgData(true, msg.msg_success));
                                    }
                                )
                            }
                        }
                    );
                }
            }
        });
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

//PUT
router.route('/deleteTeacher').put((req, res) => {
    try {
        var classRoom = new Class();
        var classId = req.body.classId;
        var teacherId = req.body.teacherId;
        var updateAt = time.getCurrentTime();

        Class.findOneAndUpdate(
            {
                _id: classId
            },
            {
                $pull:
                {
                    teachers:
                    {
                        teacher: teacherId
                    }
                }
            },
            (error, data) => {
                if (error) {
                    return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
                } else {
                    Teacher.findOneAndUpdate(
                        {
                            _id: teacherId
                        },
                        {
                            $pull:
                            {
                                classes:
                                {
                                    class: classId
                                }
                            }
                        },
                        (error, data) => {
                            if (error) return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
                            return res.status(200).send(msgRep.msgData(true, msg.msg_success));
                        }
                    )
                }
            })
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

//PUT
router.route('/addAttendance').put((req, res) => {
    try {
        var classRoom = new Class();
        var classId = req.body.id;
        var studentNumber = req.body.studentNumber;
        var date = req.body.date;
        var students = req.body.students;
        var updateAt = time.getCurrentTime();

        var attendance = {
            studentNumber: studentNumber,
            date: date,
            students: students
        }

        Class.findOneAndUpdate(
            {
                _id: classId
            },
            {
                $set:
                {
                    updateAt: updateAt
                },
                $push:
                {
                    attendances: attendance
                }
            },
            (error, data) => {
                if (error) return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
                return res.status(200).send(msgRep.msgData(true, msg.msg_success));
            })
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

//PUT
router.route('/deleteAttendance').put((req, res) => {
    try {
        var classRoom = new Class();
        var classId = req.body.classId;
        var attendanceId = req.body.attendanceId;
        var updateAt = time.getCurrentTime();

        Class.findOneAndUpdate(
            {
                _id: classId
            },
            {
                $pull:
                {
                    attendances:
                    {
                        _id: attendanceId
                    }
                }
            },
            (error, data) => {
                if (error) return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
                return res.status(200).send(msgRep.msgData(true, msg.msg_success));
            })
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed, error));
    }
});

router.route('/updateScore').put((req, res) => {
    try {
        var classId = req.body.id;
        var scoreId = req.body.scoreId;
        let midterm = req.body.midTerm;
        let finalexam = req.body.finalExam;

        console.log(req.body);

        // if (midterm instanceof Number && finalexam instanceof Number) {
        if (midterm >= 0 && finalexam >= 0) {
            var score = {
                midterm: midterm,
                finalexam: finalexam
            }

            Class.findOneAndUpdate(
                {
                    _id: classId,
                    'students._id': scoreId,
                    status: true
                },
                {
                    $set: {
                        'students.$.score': score
                    }
                },
                {
                    upsert: true
                },
                (error) => {
                    if (error) return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
                    return res.status(200).send(msgRep.msgData(true, msg.msg_success));
                }
            )
        }
        else {
            console.log('error');
            return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
        }
        // } else {
        // console.log('Not Number');
        // return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
        // }
    } catch (error) {
        return res.status(500).send(msgRep.msgData(false, msg.msg_failed));
    }
});

module.exports = router;