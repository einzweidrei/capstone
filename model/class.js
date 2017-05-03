var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var ObjectId = Schema.ObjectId;

var ClassSchema = new Schema({
    staff: { type: ObjectId },
    students: [
        {
            student: { type: ObjectId, ref: 'Student' },
            score: {
                midterm: { type: Number },
                finalexam: { type: Number }
            }
        }
    ],
    teachers: [
        {
            teacher: { type: ObjectId, ref: 'Teacher' }
        }
    ],
    attendances: [
        {
            studentNumber: { type: Number },
            date: {
                year: { type: Number },
                month: { type: Number },
                day: { type: Number },
            },
            students: [
                {
                    student: { type: ObjectId, ref: 'Student' },
                }
            ]
        }
    ],
    info: {
        name: { type: String },
        time: [
            {
                name: { type: String },
                isChoose: { type: Boolean },
                startAt: {
                    hour: { type: Number },
                    minute: { type: Number },
                    second: { type: Number }
                },
                endAt: {
                    hour: { type: Number },
                    minute: { type: Number },
                    second: { type: Number }
                },
            }
        ],
        startAt: {
            year: { type: Number },
            month: { type: Number },
            day: { type: Number },
        },
        branch: {

        },
        studentNumber: { type: Number },
        teacherNumber: { type: Number },
        room: { type: String },
        progress: { type: String },
        course: { type: ObjectId, ref: 'Course' }
    },
    createAt: {
        timestamp: { type: Date },
        year: { type: Number },
        month: { type: Number },
        day: { type: Number },
        hour: { type: Number },
        minute: { type: Number },
        second: { type: Number }
    },
    updateAt: {
        timestamp: { type: Date },
        year: { type: Number },
        month: { type: Number },
        day: { type: Number },
        hour: { type: Number },
        minute: { type: Number },
        second: { type: Number }
    },
    status: { type: Boolean }
});

ClassSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Class', ClassSchema);