var mongoose = require('mongoose'),
    discountSchema = require('./discount.model'),    
    Discount = mongoose.model('Discount'),
    nextDiscountSchema = require('./nextDiscount.model'),
    NextDiscount = mongoose.model('NextDiscount'),
    userSchema = require('../user/user.model'),
    User = mongoose.model('User'),
    categorySchema = require('../categories/category.model'),
    Category = mongoose.model('Category'),
    lodash = require('lodash');

/*
 |--------------------------------------------------------------------------
 | Retrieve all historical discounts of the logged user
 |--------------------------------------------------------------------------
 */
exports.active = function (req, res) {
    var dni = req.user.dni;
    
    User.findOne({dni: dni}, function(err, user) {
  
        if(err) res.status(500).send({ message: err.message });

        //Get the active discounts of the user
        res.send(lodash.filter(user.descuentos, { 'estado': 'Activo'} ));

    });

}

/*
 |--------------------------------------------------------------------------
 | Retrieve all online discounts of the logged user
 |--------------------------------------------------------------------------
 */
exports.proximos = function (req, res) {
    //var dni = req.user.dni;
    User.findOne({dni: dni}, function(err, user) {
  
        if(err) res.status(500).send({ message: err.message });

        //Get the next discounts of the user
        res.send(user.proximosDescuentos);

    });
}

/*
 |--------------------------------------------------------------------------
 | Create a new discount
 |--------------------------------------------------------------------------
 */
exports.create = function (req, res) {
    var discount = req.swagger.params.discount.value;

    User.findById(req.user, function(err, user) {
        if(err) res.status(500).send({ message: err.message });
        else{
            user.descuentos.push(discount);
            user.update();
            res.status(200);   
        }
    });
  
}