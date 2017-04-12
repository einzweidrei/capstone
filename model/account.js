var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var messageService = require('../_services/message.service');
var validationService = require('../_services/validation.service');
var validate = validationService.Validation;
var msg = messageService.Message;

//create type ObjectId
var ObjectId = Schema.ObjectId;

//create Account
var AccountSchema = new Schema({
	username: {
		type: String,
		required: [true, msg.msg_required],
		validate: {
			validator: v => {
				// between {6, 16}
				// character: a-z A-Z
				// digit: N/A
				// special character: _ . 
				return validate.regUsername.test(v);
			},
			message: msg.msg_username_invalid
		}
	},
	password: {
		type: String
	},
	info: {
		email: {
			type: String,
			required: [true, msg.msg_required],
			validate: {
				validator: v => {
					// {email} must match with email format (ex: example@example.ex)
					// character: a-z A-Z
					// digit: 0-9
					// special character: .
					return validate.regEmail.test(v);
				},
				message: msg.msg_email_invalid
			}
		},
		name: {
			type: String,
			required: [true, msg.msg_required],
			validate: {
				validator: v => {
					// between {6, 16}
					// character: a-z A-Z Vietnamese-alphabet
					// digit: N/A
					// special character: whitespace
					return validate.regName.test(v);
				},
				message: msg.msg_name_invalid
			}
		}
	},
	role: {
		type: ObjectId,
		required: [true, msg.msg_required],
		ref: 'Role'
	},
	status: {
		type: Boolean
	},
	token: {
		type: String
	},
	createAt: {
		timestamp: { type: String },
		year: { type: Number },
		month: { type: Number },
		day: { type: Number },
		hour: { type: Number },
		minute: { type: Number },
		second: { type: Number }
	},
	updateAt: {
		timestamp: { type: String },
		year: { type: Number },
		month: { type: Number },
		day: { type: Number },
		hour: { type: Number },
		minute: { type: Number },
		second: { type: Number }
	},
});

//plugin Pagination
AccountSchema.plugin(mongoosePaginate);

// module.exports = mongoose.model('Role', RoleSchema);
module.exports = mongoose.model('Account', AccountSchema);		