process.env.NODE_ENV = 'test';

var chai = require('chai'),
    chaiHttp = require('chai-http'),
    server = require('../app'),
    should = chai.should();


chai.use(chaiHttp);

describe('Endpoints', () => {

    //New user
    var newUser = {
        dni: "30445566",
        displayName: "Yo",
        password: "123456",
        roles: ["user"]
    }

    //User for login
    var user = {
        dni:"30445566",
        password:"123456"            
    };
        
 
    describe('Signup', () => {
        it('it should signup', (done) => {
            chai.request(server)
                .post('/api/public/auth/signup')
                .send(newUser)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });

    /*Test login success */
   describe('Login', () => {
        it('it should login', (done) => {
            chai.request(server)
                .post('/api/public/auth/login')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
        it('it should not login', (done) => {
            user.password = "654321"
            chai.request(server)
                .post('/api/public/auth/login')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });

    describe('GET movements', () => {
        it('it should GET all the movements of the loggged user', (done) => {
            var token = '';
            user.password = "123456"
            chai.request(server)
                .post('/api/public/auth/login')
                .send(user)
                .end((err, res) => {
                    token = res.text.split(':')[1].replace(/"/g, "").replace(/}/g, "");
                    chai.request(server)
                        .get('/api/private/movements')
                        .set('Authorization', token)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('array');
                        done();
                    });
                    done();
                });
            
        });
    });

    describe('GET actul discounts', () => {
        it('it should GET all the actual discounts of the loggged user', (done) => {
            var token = '';
            user.password = "123456"
            chai.request(server)
                .post('/api/public/auth/login')
                .send(user)
                .end((err, res) => {
                    token = res.text.split(':')[1].replace(/"/g, "").replace(/}/g, "");
                    chai.request(server)
                        .get('/api/private/discounts/active')
                        .set('Authorization', token)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('array');

                        done();
                    });
                    done();
                });
            
        });
    });

    describe('GET next discounts', () => {
        it('it should GET all the next discounts of the loggged user', (done) => {
            var token = '';
            user.password = "123456"
            chai.request(server)
                .post('/api/public/auth/login')
                .send(user)
                .end((err, res) => {
                    token = res.text.split(':')[1].replace(/"/g, "").replace(/}/g, "");
                    chai.request(server)
                        .get('/api/private/discounts/next')
                        .set('Authorization', token)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('array');

                        done();
                    });
                    done();
                });
            
        });
    });
    describe('Create a new movement', () => {
        it('it should GET all the next discounts of the loggged user', (done) => {
            var token = '';
            user.password = "123456"
            var movment = {
                date: Date.now,
                ammount: 500,
                categoria: "Entretenimiento",
                descripcion: "Cine hoyst"
            }
            chai.request(server)
                .post('/api/public/auth/login')
                .send(user)
                .end((err, res) => {
                    token = res.text.split(':')[1].replace(/"/g, "").replace(/}/g, "");
                    chai.request(server)
                        .post('/api/private/movement')
                        .set('Authorization', token)
                        .send(movment)
                        .end((err, res) => {
                            res.should.have.status(200);
                        done();
                    });
                    done();
                });
            
        });
    });
});
