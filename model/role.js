var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var messageService = require('../_services/message.service');
var validationService = require('../_services/validation.service');
var validate = validationService.Validation;
var msg = messageService.Message;

var RoleSchema = new Schema({
	name: {
		required: [true, msg.msg_required],
		type: String
	},
	backend_func: [
		{
			name: {
				type: String,
				required: [true, msg.msg_required]
			},
			read: {
				type: Boolean,
				required: [true, msg.msg_required]
			},
			create: {
				type: Boolean,
				required: [true, msg.msg_required]
			},
			update: {
				type: Boolean,
				required: [true, msg.msg_required]
			},
			delete: {
				type: Boolean,
				required: [true, msg.msg_required]
			}
		}
	],
	frontend_func: [
		{
			name: {
				type: String,
				required: [true, msg.msg_required]
			},
			read: {
				type: Boolean,
				required: [true, msg.msg_required]
			},
			create: {
				type: Boolean,
				required: [true, msg.msg_required]
			},
			update: {
				type: Boolean,
				required: [true, msg.msg_required]
			},
			delete: {
				type: Boolean,
				required: [true, msg.msg_required]
			}
		}
	],
	backend: {
		required: [true, msg.msg_required],
		type: Boolean
	},
	status: { type: Boolean }
});

module.exports = mongoose.model('Role', RoleSchema);