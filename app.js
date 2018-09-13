'use strict';

var SwaggerExpress = require('swagger-express-mw');
var path = require('path');
var cors = require('cors');
var express = require('express');
var logger = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var https = require('https');
var user = require('./api/modules/user/user.controller');

var app = express();

module.exports = app; // for testing

var config = {
  appRoot: __dirname, // required config
  swaggerSecurityHandlers: {
    Bearer: function (req, scope, next, cb) {
      user.ensureAuthenticated(req, scope, function(){
        cb();
      });
      
    }
  }
};


//If it isn't production, use the local env file
if(!process.env.NODE_ENV || process.env.NODE_ENV.toUpperCase() !== 'PRODUCTION'){
  const env = require('env2')('./config/.env');
}

var PORT = process.env.BACK_PORT;
var HOST = process.env.HOST;

//mongoose promise os deprecated. Use the global
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI,{
  useMongoClient: true
}).then(
  ()  => { console.log('Successful mongodb connection') 
},
  err => { console.error('Error: Could not connect to MongoDB.') }
);

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);  
 
  app.use(cors());
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  app.listen(PORT, (err)=>{
    console.log('HTTP Server listening on port %s', PORT);
  });

   //expose public dir for swagger-ui
  app.use(express.static(path.join(__dirname, 'public')));

  
});