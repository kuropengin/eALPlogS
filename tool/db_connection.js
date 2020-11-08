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
                                                                                                                                                        
const template_class = new mongoose.Schema({
  class : String , 
  tool_id : String ,
  priority : Number ,
  search_rule : {
    search_mode: String,
    search_word: String
  },
  target_rule : {
    target_mode: String
  },
  convert_rule: {
    convert_mode: String,
    convert_verb: {
      id: String,
      display: {}
    }
  }
});                                                                                                                                               
                                                                                                                                                        
                                                                                                                                                        
exports.connection = mongoose.connection;                                                                                                               
exports.collection_config = mongoose.model('configs', template_class);