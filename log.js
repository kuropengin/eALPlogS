const Syslog = require('simple-syslog-server');
const log_db = require('./tool/db_connection');
const converter = require("./tool/converter") ;


const options = {};
var logserver = Syslog.TCP(options) ;

logserver.on('msg', data => {
    try{
        var class_student = data.hostname.split('-');
        if(class_student.length == 2){
            console.log('message received. cid : ' + class_student[0] + ' sid : ' + class_student[1]);
            converter({
                class_id : class_student[0],
                student_id : class_student[1],
                tool_id : data.tag,
                timestamp : data.timestamp,
                msg : data.msg
            });
        }
        else if(data.tag == "eALPluS"){
            var temp_msg = data.msg.split(' ');
            class_student = temp_msg[0].split('-');
            console.log('message received. cid : ' + class_student[0] + ' sid : ' + class_student[1]);
            converter({
                class_id : class_student[0],
                student_id : class_student[1],
                tool_id : data.tag,
                timestamp : data.timestamp,
                msg : temp_msg.slice(1).join(' '),
                eALPluS : true
            });
        }
    }
    catch(e){}
});

module.exports = logserver;