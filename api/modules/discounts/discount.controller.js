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
        res.send(lodash.filter(user.descuentos[0], { 'estado': 'Activo'} ));

    });
}

/*
 |--------------------------------------------------------------------------
 | Retrieve all online discounts of the logged user
 |--------------------------------------------------------------------------
 */
exports.proximos = function (req, res) {
    //var dni = req.user.dni;
    
    res.send(req.user.proximosDescuentos[0]);

    /*User.findOne({dni: dni}, function(err, user) {
  
        if(err) res.status(500).send({ message: err.message });

        //Get the next discounts of the user
        res.send(user.proximosDescuentos[0]);

    });*/
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

exports.determinateDiscount = function (movement, user, next){

    console.log('Llego una categoria: ' + JSON.stringify(movement));

    Category.findOne({nombre: movement.categoria}, function(err, cat) {
        
        if (!cat){
            //Creo 
            cat = {
                nombre: movement.categoria,
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
            }

            cat.save();
        }
        //Get the active discounts of the user
        var proxDto = lodash.filter(user.proximosDescuentos[0], { 'categoria': movement.categoria});

        //Si encontré un próximo descuento, analizo si necesito o no crear un descuento
        //Si no lo encontré creo un próximo descuento y ademas me fijo si el gasto se hizo como para crear
        //un nuevo descuento
        if(proxDto){

            proxDto = proxDto[0];

            var montoNuevo = +proxDto.montoActual + +movement.ammount;

            var objetivos = lodash.filter(cat.objetivo, function(item){
                return item.monto > montoActual;
            });

            //Si no encontré objetivos llegué al último descuento disponible
            var objetivo;
            if(objetivos){
                objetivo = objetivos[0];

                if(montoNuevo > +proxDto.montoFaltante){
                    var now = Date.now();
                    var vencimiento = new Date(now.getFullYear(), now.getMonth() +1, 0);
                    
                    //Creo el nuevo descuento
                    var d = new Discount({
                        categoria: movement.categoria,
                        percentage: proxDto.percentage,
                        vencimiento: vencimiento
                    });
            
                    user.descuentos.push(d);
                        
                    proxDto.montoActual = montoNuevo;
                    proxDto.montoFaltante = +objetivo.monto - montoNuevo;
                    proxDto.percentage = objetivo.percentage;

                    user.save();
                
                }else{
                    //actualizo el proximo descuento
                    proxDto.montoActual = montoNuevo;
                    proxDto.montoFaltante = +objetivo.monto - montoNuevo;

                    user.save();
                }
            }       
          
        }else{

            proxDto = new NextDiscount ({
                montoActual: movement.ammount,
                montoFaltante: cat.objetivo[0].monto, 
                percentage: cat.objetivo[0].porcentaje
            });

            user.proximosDescuentos.push(proxDto);

            user.save();

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

            user.descuentos.push(d);
            user.save();
       }

    }); 

    next();
    
}