const mongoose = require('mongoose');                                                                                                                   
                                                                                                                                                        
const db_config = require('../config/db_config.json');                                                                                                  
                                                                                                                                                        
                                                                                                                                                        
const db_path = 'mongodb://' + db_config.mongo_url ;                                                                                                    
mongoose.connect( db_path , {                                                                                                                           
  useNewUrlParser: true,                                                                                                                                
  useUnifiedTopology: true,                                                                                                                             
  user: db_config.user,                                                                                                                                 
  pass: db_config.pass,                                                                                                                                 
  dbName: db_config.db_name,                                                                                                                            
},                                                                                                                                                      
  (err) => {                                                                                                                                            
    if(err) {                                                                                                                                           
      return console.log(err);                                                                                                                          
    }                                                                                                                                                   
});                                                                                                                                                     
mongoose.Promise = Promise;                                                                                                                             
                                                                                                                                                        
const template_config = new mongoose.Schema({
  class : String , 
  tool_id : String ,
  tool_name : String ,
  priority : Number ,
  search_rule : {
    search_mode: String,
    search_word: String
  },
  target_rule : {
    target_mode: String,
    split_index: Number
  },
  convert_rule: []

}); 

const template_eALPluS = new mongoose.Schema({
  tool_id : String ,
  tool_name : String ,
  priority : Number ,
  search_rule : {
    search_mode: String,
    search_word: String
  },
  target_rule : {
    target_mode: String,
    split_index: Number
  },
  convert_rule: []

}); 

const template_class = new mongoose.Schema({
  class : String , 
  grouping : String
}); 

const template_student = new mongoose.Schema({
  student_id : String , 
  actor : String
});

const template_temp_log = new mongoose.Schema({
  class_id : String ,
  student_id : String ,
  tool_id : String,
  timestamp : { type: Date, index: { expireAfterSeconds: 60*60*24*3 } },
  msg : String
});

exports.connection = mongoose.connection;
exports.collection_config = mongoose.model('class_configs', template_config);
exports.collection_eALPluS = mongoose.model('eALPluS_configs', template_eALPluS);
exports.collection_class = mongoose.model('classes', template_class);
exports.collection_student = mongoose.model('students', template_student);
exports.collection_temp_log = mongoose.model('temp_logs', template_temp_log);