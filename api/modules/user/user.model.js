'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcryptjs'),
    nextDiscountSchema = require('../discounts/nextDiscount.model'),
    discountSchema = require('../discounts/discount.model'),
    movementSchema = require('../movements/movement.model');

/**
 * User Schema
 */
var userSchema = new mongoose.Schema({
    dni: { 
        type: Number
    },
    password: { 
        type: String, 
        select: false 
    },
    displayName: String,
    image: {
      type: String
    },
    descuentos: {
      type: [discountSchema]
    },
    proximosDescuentos: {
      type: [nextDiscountSchema]
    },
    movimientos: {
      type: [movementSchema]
    },
    roles: {
      type: [{
        type: String,
        enum: ['user', 'admin']
      }],
      default: ['user']
    }
  });

  userSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) {
      return next();
    }
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(user.password, salt, function(err, hash) {
        user.password = hash;
        next();
      });
    });
  });

  userSchema.pre('remove', function(next) {
    // Remove all dependencies
    next();
  });

  userSchema.post('remove', function(doc) {
    console.log('%s has been removed', doc._id);
  });
  
  userSchema.methods.comparePassword = function(password, done) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
      done(err, isMatch);
    });
  };

  mongoose.model('User', userSchema);
  
  'use strict';