'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

/**
 * category Schema
 */
var categorySchema = new Schema({
  nombre:{
    type: String,
    default: ''
  },
  objetivo:[{
                monto:{
                    type: Number,
                    default: 0
                },
                porcentaje:{
                    type: String,
                    default: '5%'
                }
    }],
  relacion:{
    type: String,
    default: ''
  },
  porcentaje:{
    type: String,
    default: '5%'
  }
});

mongoose.model('Category', categorySchema);

'use strict';
