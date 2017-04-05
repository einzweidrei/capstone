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

router.use(function (req, res, next) {
    console.log('class_router is connecting');
    next();
});

//GET -- Get All
router.route('/getAll').get((req, res) => {
    try {
        var page = req.query.page;

        //create query
        var query = { status: true };

        var populateQuery = [

        ]

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
})

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

//POST -- Create
router.route('/create').post((req, res) => {
    try {
        var classRoom = new Class();
        classRoom.info.name = req.body.name;

        classRoom.students = req.body.students;
        classRoom.teachers = req.body.teachers;

        classRoom.info.time = req.body.time;
        classRoom.info.room = req.body.room;

        classRoom.info.studentNumber = req.body.students.length;
        classRoom.info.teacherNumber = req.body.teachers.length;

        classRoom.info.course = req.body.course;
        classRoom.info.progress = req.body.progress;
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
router.route('/updateStudentInClass').put((req, res) => {
    try {
        var classRoom = new Class();
        var classId = req.body.classId;
        var studentId = req.body.studentId;
        var student = { student: studentId };
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
router.route('/updateAttendance').put((req, res) => {
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

module.exports = router;