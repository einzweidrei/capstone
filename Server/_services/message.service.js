var Message = (function () {
    //[<>]
    Message.msg_success = "Success";
    Message.msg_failed = "Failed";
    Message.msg_required = "Required";
    Message.msg_data_not_exist = "DATA_NOT_EXIST";

    //[Username]
    Message.msg_username_exist = "Username already exists";
    Message.msg_username_notExist = "Username is not exists";
    Message.msg_username_invalid = "Invalid Username";

    //[Email]
    Message.msg_email_exist = "Email already exists";
    Message.msg_email_invalid = "Invalid Email";

    //[Passwod]
    Message.msg_password_invalid = "Invalid Password";

    //[Name]
    Message.msg_name_invalid = "Invalid Name";

    //[Role]
    Message.msg_role_invalid = "Invalid Role";

    //[Account]
    Message.msg_account_notExist = "Account is not exists";

    //[Course]
    Message.msg_course_exist = "Course already exists";

    //[Staff]
    Message.msg_teacher_exist = "TEACHER_EXIST";

    function Message() { }

    Message.prototype.msgData = (status, msg, data) => {
        return JSON.stringify({
            status: status,
            message: msg,
            data: data
        });
    }

    Message.prototype.msgFailedOut = (status, msg, key) => {
        return JSON.stringify({
            status: status,
            message: msg
        })
    }

    return Message;
}());

exports.Message = Message;
