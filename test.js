var request = require('request');


request({
    url: process.env.BACK_URI + process.env.LOGIN_ENDPOINT,
    headers: {'content-type' : 'application/json'},
    method: 'POST',
    body: JSON.stringify( {
        dni: process.env.DNI_LOGIN,
        password: process.env.PASS_LOGIN
    })}, function (err, res, body) {
        console.log('Resultado:' + JSON.stringify(res) + ' ' + JSON.stringify(err) + res.statusCode );
        if (!err && res.statusCode == 200) {
            body = JSON.parse(body);
            var token = body.token;
            request({
                headers: {'content-type' : 'application/json', 'Authorization': token },
                url: process.env.BACK_URI +  process.env.CONSUMO_ENDPOINT,
                method: 'POST',
                body: JSON.stringify({ movimiento : {
                        date: new Date(),
                        ammount: 576,
                        categoria: "SUPERMERCADO",
                        descripcion: "COMPRA",
                        cardId: 123
                        } 
                })

            },function(err, res, body){
                if (!err && res.statusCode == 200) {
                    console.log('Di de alta el movimiento');
                }
            });
            
        }
    }
);