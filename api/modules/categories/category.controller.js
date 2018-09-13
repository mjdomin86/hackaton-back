var mongoose = require('mongoose'),
    categorySchema = require('./category.model'),    
    Category = mongoose.model('Category');

/*
 |--------------------------------------------------------------------------
 | Retrieve category details for selected discount or movement
 |--------------------------------------------------------------------------
 */
exports.category = function (req, res) {
    var nombre = req.category.nombre;
    
    Category.findOne({nombre: nombre}, function(err, cat) {
  
        if(err) res.status(500).send({ message: err.message });
        else res.send(cat);        

    });
}

/*
 |--------------------------------------------------------------------------
 | Retrieve all categories
 |--------------------------------------------------------------------------
 */
exports.categories = function (req, res) {
    
    Category.findAll( function(err, allCategories) {
  
        if(err) res.status(500).send({ message: err.message });

        res.send(allCategories);

    });
}

/*
 |--------------------------------------------------------------------------
 | Create a new category
 |--------------------------------------------------------------------------
 */
exports.create = function (req, res) {
    var category = req.swagger.params.category.value;

    c = new Category(category);

    c.save(function (err){
        if(err) res.status(500).send({ message: err.message });
        else res.status(200);
    });
}