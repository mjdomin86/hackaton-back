'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Movement Schema
 */
var movementSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  ammount:{
    type: Number,
    default: ''
  },
  categoria:{
    type: String,
    default: ''
  },
  descripcion:{
    type: String
  }
});

mongoose.model('Movement', movementSchema);

'use strict';