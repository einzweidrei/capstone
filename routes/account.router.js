var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var validationService = require('../_services/validation.service');
var messageService = require('../_services/message.service');
var validate = new validationService.Validation();
var msg = messageService.Message;
var msgRep = new messageService.Message();
var timeService = require('../_services/time.service');
var time = new timeService.Time();

// create Account object
var Account = require('../model/account');
var Role = require('../model/role');

router.use(function (req, res, next) {
	console.log('router_account is connecting');
	next();
});

const hash_key = 'embassy';
const token_length = 64;

function hash(content) {
	const crypto = require('crypto');
	const hash = crypto.createHmac('sha256', hash_key)
		.update(content)
		.digest('hex');
	return hash;
}

function getToken() {
	var crypto = require('crypto');
	var token = crypto.randomBytes(token_length).toString('hex');
	return token;
}

//------CMS

//POST -- Authentication
router.route('/cms/auth').post((req, res) => {
	try {
		//get data in request body
		var username = req.body.username;
		var password = hash(req.body.password);

		var loginAt = time.getCurrentTime();

		//check exist [username]
		Account.findOne({ username: username }).populate('role')
			.exec((err, account) => {
				if (!err) {
					//not exist [username]

					if (account === null) {
						return res.json({
							status: false,
							message: msg.msg_username_notExist
						});
					}

					//exist [username]
					else {
						if (account.status === false) {
							return res.json({
								status: false,
								message: 'Your account has been deleted'
							})
						}

						//check [role]
						if (account.roleTest.backend === true) {

							//check valid [password] 
							//valid
							if (password == account.password) {

								Account.findOneAndUpdate(
									{
										_id: account._id
									},
									{
										$set:
										{
											'session.loginAt': loginAt,
											token: getToken()
										}
									},
									{
										upsert: true
									},
									(err, data) => {
										if (!err) {
											Account.findOne({ _id: account._id }).select('_id username role token info').exec((err, user) => {
												if (!err) {
													return res.send(msgRep.msgData(true, msg.msg_success, user));
												} else {
													return res.send(msgRep.msgFailedOut(false, err));
												}
											})
										} else {
											return res.send(msgRep.msgFailedOut(false, err));
										}
									});
							}

							//invalid
							else {
								return res.send(msgRep.msgFailedOut(false, msg.msg_password_invalid));
							}
						} else {
							return res.status(403).json({
								status: false
							});
						}
					}
				} else {
					return res.send(msgRep.msgFailedOut(false, err));
				}
			});
	} catch (error) {
		return res.send(msgRep.msgFailedOut(false, err));
	}
});

//POST -- Authentication
router.route('/login').post((req, res) => {
	try {
		//get data in request body
		var username = req.body.username;
		var password = hash(req.body.password);

		var loginAt = time.getCurrentTime();

		//check exist [username]
		Account.findOne({ username: username }).populate('role')
			.exec((err, account) => {
				if (!err) {
					//not exist [username]
					if (account === null) {
						return res.json({
							status: false,
							message: msg.msg_username_notExist
						});
					}

					//exist [username]
					else {
						if (account.status === false) {
							return res.json({
								status: false,
								message: 'Your account has been deleted'
							})
						}

						//check valid [password] 
						//valid
						if (password == account.password) {

							Account.findOneAndUpdate(
								{
									_id: account._id
								},
								{
									$set:
									{
										'session.loginAt': loginAt,
										token: getToken()
									}
								},
								{
									upsert: true
								},
								(err, data) => {
									if (!err) {
										Account.findOne({ _id: account._id }).select('_id username role token info').exec((err, user) => {
											if (!err) {
												return res.send(msgRep.msgData(true, msg.msg_success, user));
											} else {
												return res.send(msgRep.msgFailedOut(false, err));
											}
										})
									} else {
										return res.send(msgRep.msgFailedOut(false, err));
									}
								});
						}

						//invalid
						else {
							return res.send(msgRep.msgFailedOut(false, msg.msg_password_invalid));
						}
					}
				} else {
					return res.send(msgRep.msgFailedOut(false, err));
				}
			});
	} catch (error) {
		return res.send(msgRep.msgFailedOut(false, err));
	}
});

//POST -- Create Account
router.route('/register').post((req, res) => {
	var account = new Account();

	//get data in request body
	account.username = req.body.username;
	account.password = hash(req.body.password);
	account.info.email = req.body.email;
	account.info.name = req.body.name;
	account.role = req.body.role;
	account.status = true;
	account.token = null;

	account.createAt = time.getCurrentTime();
	account.updateAt = time.getCurrentTime();

	//validate 
	var error = account.validateSync();

	//invalid
	if (error) {
		return res.json({
			error: error.errors,
			status: false,
			message: msg.msg_failed
		});
	}

	//valid
	else {

		//validate [password]
		//invalid [password]
		if (!validate.passwordValidate(req.body.password)) {
			return res.json({
				status: false,
				error: {
					password: {
						message: msg.msg_password_invalid,
						name: "ValidatorError",
						value: req.body.password
					}
				}
			})
		}

		//valid [password]
		else {
			//check valid [role]
			Role.findOne({ _id: account.role }).exec((err, roles) => {
				if (!err) {

					//valid [role]
					if (roles !== null) {

						//check duplicate [username]
						Account.findOne({ username: account.username })
							.exec((err, accounts) => {

								if (!err) {

									//duplicate [username]
									if (accounts !== null) {
										return res.json({
											status: false,
											message: msg.msg_username_exist
										});
									}

									//non-duplicate [username]
									else {

										//check duplicate [email]
										Account.findOne({ 'info.email': account.info.email }).exec((err, acc) => {

											//duplicate [email]
											if (acc !== null) {
												return res.json({
													status: false,
													message: msg.msg_email_exist
												});
											}

											//non-duplicate [email]
											else {
												account.save((err) => {
													if (err) return res.send(err);
													return res.json({
														status: true,
														account: account,
														message: msg.msg_success
													});
												});
											}
										});
									}
								} else {
									return res.json({
										status: false,
										message: msg.msg_failed
									})
								}
							});
					}

					//invalid [role]
					else {
						return res.json({
							status: false,
							message: msg.msg_role_invalid
						});
					}
				} else {
					return res.json({
						status: false,
						message: msg.msg_failed
					})
				}
			})
		}
	}
});

//POST -- Create Account
router.route('/cms/create').post((req, res) => {
	var account = new Account();

	//get data in request body
	account.username = req.body.username;
	account.password = hash(req.body.password);
	account.info.email = req.body.email;
	account.info.name = req.body.name;
	account.role = req.body.role;
	account.status = true;
	account.token = null;

	account.createAt = time.getCurrentTime();
	account.updateAt = time.getCurrentTime();

	//validate
	var error = account.validateSync();

	//invalid
	if (error) {
		return res.json({
			error: error.errors,
			status: false,
			message: msg.msg_failed
		});
	}

	//valid
	else {

		//validate [password]
		//invalid [password]
		if (!validate.passwordValidate(req.body.password)) {
			return res.json({
				status: false,
				error: {
					password: {
						message: msg.msg_password_invalid,
						name: "ValidatorError",
						value: req.body.password
					}
				}
			})
		}

		//valid [password]
		else {
			//check valid [role]
			Role.findOne({ _id: req.body.role }).exec((err, roles) => {
				if (!err) {

					console.log(roles);

					//valid [role]
					if (roles !== null) {

						//check duplicate [username]
						Account.findOne({ username: account.username })
							.exec((err, accounts) => {

								if (!err) {

									//duplicate [username]
									if (accounts !== null) {
										return res.json({
											status: false,
											message: msg.msg_username_exist
										});
									}

									//non-duplicate [username]
									else {

										//check duplicate [email]
										Account.findOne({ 'info.email': account.info.email }).exec((err, acc) => {

											//duplicate [email]
											if (acc !== null) {
												return res.json({
													status: false,
													message: msg.msg_email_exist
												});
											}

											//non-duplicate [email]
											else {
												account.roleTest.name = roles.name;
												account.roleTest.backend_func = roles.backend_func;
												account.roleTest.frontend_func = roles.frontend_func;
												account.backend = roles.backend;

												account.save((err) => {
													if (err) return res.send(err);
													return res.json({
														status: true,
														account: account,
														message: msg.msg_success
													});
												});
											}
										});
									}
								} else {
									return res.json({
										status: false,
										message: msg.msg_failed
									})
								}
							});
					}

					//invalid [role]
					else {
						return res.json({
							status: false,
							message: msg.msg_role_invalid
						});
					}
				} else {
					return res.json({
						status: false,
						message: msg.msg_failed
					})
				}
			})
		}
	}
});

//GET -- Get by {page} {role} {email}
//***Warning***: check page = number, check valid role 
router.route('/cms/getAll').get((req, res) => {
	var page = req.query.page;
	var role = req.query.role;
	var email = req.query.email;
	var query = { status: true };

	// query [role] & [page] valid
	if (typeof role !== "undefined" && role !== "" && typeof email !== "undefined" && email !== "") {
		var regexp = new RegExp(email, 'i');
		query = { 'info.email': regexp, role: role, status: true };
	}
	else {
		// query [role] valid
		if (typeof role !== "undefined" && role !== "") {
			query = { role: role, status: true };
		}

		// query [page] valid
		if (typeof email !== "undefined" && email !== "") {
			var regexp = new RegExp(email, 'i');
			query = { 'info.email': regexp, status: true };
		}
	}

	// create options
	var options = {
		select: '_id username role info.name info.email',
		// sort: { date: -1 },
		populate: [{ path: 'role', select: "_id name" }],
		page: page,
		limit: 10
	};

	// get data
	Account.paginate(query, options).then(data => {
		return res.json({
			accounts: data,
			status: true,
			message: msg.msg_success
		})
	});
});

//GET
router.route('/cms/getAccountbyId').get((req, res) => {
	var id = req.query.id;
	Account.findOne({ _id: id, status: true }).populate('role').exec((err, account) => {
		if (!err) {
			return res.json({
				account: account,
				status: true,
				message: msg.msg_success
			})
		} else {
			return res.json({
				status: false,
				message: msg.msg_failed
			});
		}
	});
});

//PUT -- Update
router.route('/cms/updateRole').put((req, res) => {
	var id = req.body.id;

	// var data = new Role();
	// // data.name = req.body.name;
	// data.backend_func = req.body.backend_func;
	// data.frontend_func = req.body.frontend_func;
	// data.backend = req.body.backend;

	if (!id) {
		return res.json({
			status: false,
			message: msg.msg_failed
		})
	}

	// //validate 
	// var error = data.validateSync();

	// //invalid
	// if (error) {
	//     return res.json({
	//         error: error.errors,
	//         status: false,
	//         message: msg.msg_failed
	//     });
	// }

	// console.log(id);
	Account.findOneAndUpdate(
		{
			_id: id,
			status: true
		},
		{
			$set:
			{
				'roleTest.frontend_func': req.body.frontend_func,
				'roleTest.backend_func': req.body.backend_func,
				'roleTest.backend': req.body.backend
			}
		},
		{
			upsert: true
		},
		(err, data) => {
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

//PUT
router.route('/cms/update').put((req, res) => {
	var id = req.body.id;
	var email = req.body.email;
	var name = req.body.name;
	var role = req.body.role;

	var updateAt = time.getCurrentTime();

	if (!validate.emailValidate(email) || !validate.nameValidate(name)) {
		return res.json({
			status: false,
			message: 'Validate failed'
		})
	}

	Account.findOne({ _id: id }).exec((err, acc) => {
		if (!err) {

			//not null
			if (acc !== null) {

				//check duplicate [email]
				if (email !== acc.info.email) {

					Account.findOne({ 'info.email': email }).exec((err, acc) => {
						if (!err) {
							if (acc !== null) {
								return res.json({
									status: false,
									message: msg.msg_email_exist
								});
							} else {

								//check valid [role]
								Role.findOne({ _id: role }).exec((err, roles) => {
									if (!err) {
										if (roles !== null) {

											//udpate 
											Account.findOneAndUpdate(
												{
													_id: id
												},
												{
													$set:
													{
														role: role,
														'info.email': email,
														'info.name': name,
														updateAt: updateAt
													}
												},
												{
													upsert: true
												},
												(err, account) => {
													if (!err) {
														return res.json({
															status: true,
															message: msg.msg_success
														});
													} else {
														return res.json({
															error: err,
															status: false,
															message: msg.msg_failed
														})
													}
												});
										}
									} else {
										return res.json({
											status: false,
											message: msg.msg_role_invalid
										});
									}
								});
							}
						} else {
							return res.json({
								status: false,
								message: err
							});
						}
					});
				}

				// duplicated [Email]
				else {
					Role.findOne({ _id: role }).exec((err, roles) => {
						if (!err) {
							if (roles !== null) {

								//udpate 
								Account.findOneAndUpdate(
									{
										_id: id
									},
									{
										$set:
										{
											role: role,
											'info.email': email,
											'info.name': name
										}
									},
									{
										upsert: true
									},
									(err, account) => {
										if (!err) {
											return res.json({
												status: true,
												message: msg.msg_success
											});
										} else {
											return res.json({
												error: err,
												status: false,
												message: msg.msg_failed
											})
										}
									});
							}
						} else {
							return res.json({
								status: false,
								message: msg.msg_role_invalid
							});
						}
					});
				}
			} else {
				return res.json({
					status: false,
					message: msg.msg_failed
				});
			}
		} else {
			return res.json({
				status: false,
				message: msg.msg_failed
			});
		}
	});
});

//PUT -- Detele (status: false)
router.route('/cms/delete').put((req, res) => {
	var id = req.body.id;

	if (typeof id === "undefined") {
		return res.json({
			status: false,
			message: msg.msg_failed
		})
	}

	Account.findOneAndUpdate(
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
		(err, account) => {
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