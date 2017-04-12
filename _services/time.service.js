var Time = (function () {

    function Time() { }

    Time.prototype.getCurrentTime = () => {
        var today = new Date();
        var second = today.getSeconds();
        var minute = today.getMinutes();
        var hour = today.getHours();
        var day = today.getDate();
        var month = today.getMonth() + 1;
        var year = today.getFullYear();
        return {
            timestamp: today,
            second: second,
            minute: minute,
            hour: hour,
            day: day,
            month: month,
            year: year
        }
    }

    Time.prototype.parseTimetoObject = (time) => {
        var today = new Date(time);
        var second = today.getSeconds();
        var minute = today.getMinutes();
        var hour = today.getHours();
        var day = today.getDate();
        var month = today.getMonth() + 1;
        var year = today.getFullYear();
        return {
            timestamp: today,
            second: second,
            minute: minute,
            hour: hour,
            day: day,
            month: month,
            year: year
        }
    }

    return Time;
}());

exports.Time = Time;