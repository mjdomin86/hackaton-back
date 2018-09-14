var mongoose = require('mongoose'),
    movementSchema = require('./movement.model'),    
    Movement = mongoose.model('Movement'),
    userSchema = require('../user/user.model'),
    User = mongoose.model('User'),
    discountSchema = require('../discounts/discount.model'),    
    Discount = mongoose.model('Discount'),
    nextDiscountSchema = require('../discounts/nextDiscount.model'),
    NextDiscount = mongoose.model('NextDiscount'),
    userSchema = require('../user/user.model'),
    User = mongoose.model('User'),
    categorySchema = require('../categories/category.model'),
    Category = mongoose.model('Category'),
    lodash = require('lodash');


/*
 |--------------------------------------------------------------------------
 | Retrieve all movements of the logged user
 |--------------------------------------------------------------------------
 */
exports.movements = function (req, res) {
    var dni = req.user.dni;
 
    Movement.find({cardId: dni}, function(err, movimientos) {
  
        if(err) res.status(500).send({ message: err.message });

        res.send({list: movimientos});

    });
    

}

/*
 |--------------------------------------------------------------------------
 | Create a new movement
 |--------------------------------------------------------------------------
 */
exports.create = function (req, res) {
    var user = req.user;
    var movimiento = req.body.movimiento;

    var movimiento = new Movement({
        date: movimiento.date,
        ammount:movimiento.ammount,
        categoria:movimiento.categoria,
        descripcion: movimiento.descripcion,
        cardId: movimiento.cardId
    });

    movimiento.save();

    User.findOne({dni: movimiento.cardId}, function(err, user) {

        //Creo un usuario con clave por default. Hay que poner un mecanismo para 
        //que la primera vez que haga login lo cambie
        if(!user){
            user = new User({
                dni: movimiento.cardId,
                password: '123456',
                displayName: movimiento.cardId,
                image: 'cover10.png'
            });

            user.save();
        }
        //check if the movemnt generates a new discount.
        Category.findOne({nombre: movimiento.categoria}, function(err, cat) {
            if (!cat){
                //Creo 
                cat = new Category ({
                    nombre: movimiento.categoria,
                    objetivo:[{
                        monto: 1000,
                        porcentaje:  '5%'
                       },
                       {
                        monto: 2000,
                        porcentaje:  '10%'
                       },
                       {
                        monto: 3000,
                        porcentaje:  '15%'
                       },
                       {
                        monto: 5000,
                        porcentaje:  '20%'
                       },
                       {
                        monto: 6000,
                        porcentaje:  '25%'
                       },
                        ],
                      relacion:'',
                      porcentaje:''
                });
    
                cat.save();
            }

            //Get the active discounts of the user
            var proxDto = lodash.filter(user.proximosDescuentos, { 'categoria': movimiento.categoria})

            //Si encontré un próximo descuento, analizo si necesito o no crear un descuento
            //Si no lo encontré creo un próximo descuento y ademas me fijo si el gasto se hizo como para crear
            //un nuevo descuento
            if(proxDto[0]){
                proxDto = proxDto[0];
    
                var montoNuevo = +proxDto.montoActual + +movimiento.ammount;
    
                var objetivos = lodash.filter(cat.objetivo, function(item){
                    return item.monto > montoNuevo;
                });
    
                


                //Si no encontré objetivos llegué al último descuento disponible
                var objetivo;
                if(objetivos){
                    objetivo = objetivos[0];
    
                    if(montoNuevo > +proxDto.montoFaltante){
                        var now = new Date();
                        var vencimiento = new Date(now.getFullYear(), now.getMonth() +1, 0);
                        
                        //Creo el nuevo descuento
                        var d = new Discount({
                            categoria: movimiento.categoria,
                            percentage: proxDto.percentage,
                            vencimiento: vencimiento
                        });
                
                        User.update({dni: movimiento.cardId}, 
                            {$push: {descuentos: d}},
                            function(err, numAffected){
                                if(err) console.log('Error al crear el nuevo descuento');
                            });
                        
                        User.update(
                            {dni: movimiento.cardId, 'proximosDescuentos.categoria': movimiento.categoria}, 
                            {'$set': {
                                'proximosDescuentos.$.montoActual': montoNuevo,
                                'proximosDescuentos.$.montoFaltante': +objetivo.monto - +montoNuevo,
                                'proximosDescuentos.$.percentage': objetivo.porcentaje
                            }}
                            , function(err, numAffected){
                                if(err) console.error('Error al crear' + err);
                                console.log(numAffected);
                        });

                    
                    }else{
                        //actualizo el proximo descuento
                        User.update(
                            {dni: movimiento.cardId, 'proximosDescuentos.categoria': movimiento.categoria}, 
                            {'$set': {
                                'proximosDescuentos.$.montoActual': montoNuevo,
                                'proximosDescuentos.$.montoFaltante': +objetivo.monto - +montoNuevo
                            }}
                            , function(err, numAffected){
                                if(err) console.error('Error al crear' + err);
                                console.log(numAffected);
                        });

                    }
                }       
              
            }else{
                proxDto = new NextDiscount ({
                    categoria: movimiento.categoria,
                    montoActual: movimiento.ammount,
                    montoFaltante: +cat.objetivo[0].monto - +movimiento.ammount, 
                    percentage: cat.objetivo[0].porcentaje
                });

                User.update({dni: movimiento.cardId}, 
                            {$push: {proximosDescuentos: proxDto}},
                            function(err, numAffected){
                                if(err) console.log('Error al crear el nuevo descuento');
                            });
    
            }

            var relacion = cat.relacion;
           //Tengo que guardar un nuevo descuento
           if(relacion){
                var now = Date.now();
                var vencimiento = new Date(now.getFullYear(), now.getMonth() +1, 0);
                
                //Creo el nuevo descuento
                var d = new Discount({
                    categoria: relacion,
                    percentage: cat.porcentaje,
                    vencimiento: vencimiento
                });
    
                User.update({dni: movimiento.cardId}, 
                    {$push: {descuentos: d}},
                    function(err, numAffected){
                        if(err) console.log('Error al crear el nuevo descuento');
                    });
           }

           res.status(200).send({ message: 'ok' });
           
        }); 


    });

}