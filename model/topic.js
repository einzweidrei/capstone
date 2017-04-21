var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var ObjectId = Schema.ObjectId;

var TopicSchema = new Schema({
    info: {
        title: { type: String },
        type: { type: String },
        priority: { type: String },
        author: {
            type: ObjectId,
            ref: 'Account'
        },
        comments: { type: Number }
    },
    comments: [
        {
            author: {
                type: ObjectId,
                ref: 'Account'
            },
            content: { type: String },
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
        }
    ],
    process: { type: String },
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

TopicSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Topic', TopicSchema);