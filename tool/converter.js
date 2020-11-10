const request = require('request');
const lrs_config = require('../config/lrs_config.json');    

const log_db = require('../tool/db_connection');

const collection_config = log_db.collection_config;
const collection_class = log_db.collection_class;
const collection_student = log_db.collection_student;
const collection_temp_log = log_db.collection_temp_log;



const converter = function(log){
    config_check(log);
}

const config_check = function(log){
    collection_config.find({ class: log.class_id }, function(err, docs){
        if(err){
            console.log("config search error : " + log.class_id);
        }
        else{
            if(!docs.length){
                console.log("Not found config : " + log.class_id);
            }
            else{
                log_search(log, docs);
            }
        }
    });
}

const log_search = function(log, config){
    var hit_list = [];

    for(var one_config of config){
        try{
            if(one_config.search_rule.search_mode == "all"){
                if(log.msg.search(one_config.search_rule.search_word) != -1){
                    
                    hit_list.push(one_config);
                }
            }
            else if(one_config.search_rule.search_mode == "part"){

            }
            else{
                throw 'search mode error';
            }
        }
        catch(e){
            console.log("config error. id : " + one_config._id + ", info : " + e);
        }   
    }

    if(!hit_list.length){
        temp_save(log);
    }
    else{
        var priority_flag = false;
        var select_config = {};
        for(var priority = 5 ; priority >= 0; priority--){
            for(var priority_check of hit_list){
                if(priority_check.priority == priority){
                    
                    priority_flag = true;
                    select_config = priority_check;
                    break;
                }
            }
            if(priority_flag){
                break;
            }
        }
        
        log_convert_init(log,select_config);
    }
}

const log_convert_init = function(log, config){
    collection_class.find({ class: log.class_id }, function(err, cdocs){
        if(err){
            console.log("class search error : " + log.class_id);
        }
        else{
            if(!cdocs.length){
                console.log("Not found class : " + log.class_id);
                convert_class_get(log, config);
            }
            else{
                var class_data = cdocs[0];
                collection_student.find({ student_id: log.student_id }, function(err, sdocs){
                    if(err){
                        console.log("student search error : " + log.student_id);
                    }
                    else{
                        var student_data = sdocs[0];
                        if(!sdocs.length){
                            console.log("Not found student : " + log.student_id);
                            convert_student_get(log, config);
                        }
                        else{
                            log_convert(log, config, class_data, student_data);
                        }
                    }
                });
            }
        }
    });
}

const log_convert = function(log, config, class_data, student_data){
    var options = {
        uri: lrs_config.xapi_url + "/data/xAPI/statements",
        method: 'POST',
        headers: {
            "Content-type": "application/json",
            "X-Experience-API-Version": "1.0.3",
            "Authorization": lrs_config.Authorization
        },
        json: []
    };

    

    for(var one_convert_rulu of config.convert_rule){
        try{
            var target_temp;

            if(config.target_rule.target_mode == "static"){
                target_temp = config.target_rule.target_static;
            }
            else if(config.target_rule.target_mode == "split"){
                target_temp = log.msg.split(' ')[config.target_rule.split_index];
            }
            else if(config.target_rule.target_mode == "range"){
                target_temp = log.msg.substring(config.target_rule.target_range_start,config.target_rule.target_range_end);
            }
            else{
                throw 'target mode error';
            }

            options.json.push({
                "actor": JSON.parse(student_data.actor),
                "verb": JSON.parse(one_convert_rulu),
                "object": {
                    "id": lrs_config.eALPluS_url + "/connection/" + log.class_id + "/" + config.tool_id + "/?target=" + target_temp,
                    "definition":{
                        "type":"http://id.tincanapi.com/activitytype/resource",
                        "name":{
                            "en": config.tool_name + " " + target_temp
                        }
                    }
                },
                "timestamp": log.timestamp,
                "context":{
                    "platform": "eALPlogS",
                    "language": "ja",
                    "contextActivities": {
                        "grouping": [
                            {
                                "id": lrs_config.eALPluS_url,
                                "definition": {
                                    "type": "http://id.tincanapi.com/activitytype/lms",
                                    "name": {
                                    "en": "eALPluS"
                                    }
                                },
                                "objectType": "Activity"
                            },
                            {
                                "id": lrs_config.eALPluS_url + "/connection/" + log.class_id + "/" + config.tool_id,
                                "definition":{
                                    "type":"http://id.tincanapi.com/activitytype/lms/tool",
                                    "name":{
                                        "en": config.tool_name
                                    }
                                }  
                            },
                            JSON.parse(class_data.grouping)
                        ]
                    }
                }
            });
        }
        catch(e){
            console.log("convert error : " + e);
        }   
    }
    request(options, function (error, response, body){
        if(response.statusCode != 200){
            temp_save(log);
        }
    });
}

const convert_class_get = function(log, config){
    var pipeline = '[{"$project": { "statement": 1, "_id": 0 }},{"$match": {"$or": [{"statement.object.definition.extensions.https://w3id&46;org/learning-analytics/learning-management-system/external-id": {"$in": ["' + log.class_id + '"]}}]}},{"$limit": 1}]';

    var options = {
        uri: lrs_config.lrs_url + "/api/statements/aggregate?cache=false&maxTimeMS=5000&maxScan=10000&pipeline=" + encodeURIComponent(pipeline),
        method: 'GET',
        json: true,
        headers: {
            "X-Experience-API-Version": "1.0.3",
            "Authorization": lrs_config.Authorization
        }
    };

    request(options, function (error, response, body) {
        if(response.statusCode != 200){
            temp_save(log);
        }
        else{
            try{
                if(body[0].statement.object){
                    var grouping_str = JSON.stringify(body[0].statement.object);
                    var class_info = new collection_class({class : log.class_id,grouping :grouping_str});
                    class_info.save(err => {
                        if (err){
                            console.log("class info save error : " + err);
                        }
                        else{
                            log_convert_init(log, config);
                        }
                    });
                }
                else{
                    throw 'not found statement';
                }
            }
            catch(e){
                console.log("class get error.  class_id : " + log.class_id + ", info : " + e);
                temp_save(log);
            }  
        }
    })
}

const convert_student_get = function(log, config){
    var pipeline = '[{"$project": { "statement": 1, "_id": 1 }},{"$match": {"$or": [{"statement.actor.mbox": {"$regex": "' + log.student_id + '"}}]}},{"$limit": 1}]';

    var options = {
        uri: lrs_config.lrs_url + "/api/statements/aggregate?cache=false&maxTimeMS=5000&maxScan=10000&pipeline=" + encodeURIComponent(pipeline),
        method: 'GET',
        json: true,
        headers: {
            "X-Experience-API-Version": "1.0.3",
            "Authorization": lrs_config.Authorization
        }
    };

    request(options, function (error, response, body) {
        if(response.statusCode != 200){
            temp_save(log);
        }
        else{
            try{
                if(body[0].statement.actor){
                    var actor_str = JSON.stringify(body[0].statement.actor);
                    var student_info = new collection_student({student_id : log.student_id ,actor : actor_str});
                    student_info.save(err => {
                        if (err){
                            console.log("student info save error : " + err);
                        }
                        else{
                            log_convert_init(log, config);
                        }
                    });
                }
                else{
                    throw 'not found statement';
                }
            }
            catch(e){
                console.log("class get error.  student_id : " + log.student_id + ", info : " + e);
                temp_save(log);
            }  
        }
    })
}

const temp_save = function(log){
    var temp_save_log = new collection_temp_log(log);
    temp_save_log.save(err => {
        if (err){
            console.log("Temp save error : " + err);
        }
    });
}


module.exports = converter;
