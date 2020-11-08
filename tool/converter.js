var request = require('request');
var options = {
    uri: "https://kuroxapi.yukkuriikouze.com/data/xAPI/statements",
    headers: {
        "Content-type": "application/json",
        "X-Experience-API-Version": "1.0.3",
        "Authorization":"Basic YmVjMmMxN2E0MjVlNTdhY2VmOGMyYjE4Y2RiMWE3MWFkNmU2MTNmMjo3Zjk0NGRhODJhY2U0NDFlZjEyNWYxNWJiZmVjZjk4Nzk4YmU5YjEx"
    },
    json: [
        {
            "actor": {
                "name": "椋平 黒河内",
                "mbox": "mailto:20w2034b@shinshu-u.ac.jp",
                "objectType": "Agent"
            },
            "verb": {},
            "object": {
                "id": "https://kuromoodle.yukkuriikouze.com/course/view.php?id=2",
                "definition": {
                    "type": "http://id.tincanapi.com/activitytype/lms/course",
                    "name": {
                        "en": "底辺情報工学特論/総合理工学研究科【工学専攻】/前期/月曜-３時限"
                    },
                    "extensions": {
                        "https://w3id.org/learning-analytics/learning-management-system/external-id": "TSJ46500"
                    }
                },
                "objectType": "Activity"
            }
        }
    ]
}; 

let converter_rule = {
    "saved":{"id":"http://activitystrea.ms/schema/1.0/save","display":{"en": "saved"}},
    "run":{"id":"http://activitystrea.ms/schema/1.0/start","display":{"en": "started"}}
}

/*
for(var search in converter_rule){
    if(data.msg.search(search) != -1){
        let send_data = options;
        send_data.json[0].verb = converter_rule[search];
        request.post(send_data, function(error, response, body){console.log(response);});
    }
} 
*/

const converter = function(log){
    console.log(log);
}
module.exports = converter;