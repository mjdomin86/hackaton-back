'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

/**
 * discount Schema
 */
var discountSchema = new Schema({
  categoria:{
    type: String,
    default: ''
  },
  percentage:{
      type: String,
      default: '5%'
  },
  vencimiento: {
      type: Date
  },
  estado:{
    type: String,
    default: "Activo"
  }
});

mongoose.model('Discount', discountSchema);

'use strict';