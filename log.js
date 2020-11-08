const Syslog = require('simple-syslog-server');
const log_db = require('./tool/db_connection');
const converter = require("./tool/converter") ;

/*
var temp_data = {};
temp_data.class="pit";
temp_data.tool_id="tool_01";
temp_data.search_rule={search_mode:"normal"};

var save_class = new log_db.collection_config(temp_data);

save_class.save(err => {
    if (err){
        console.log(err);
    }
    else{
        console.log("Received POST Data!");
    }
});
*/

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
    }
    catch(e){}
});

module.exports = logserver;