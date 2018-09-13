var mongoose = require('mongoose'),
    userSchema = require('./user.model'),    
    User = mongoose.model('User'),
    jwt = require('jwt-simple');
    moment = require('moment'),
    request = require('request'),
  

/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
exports.ensureAuthenticated = function(req, res, next) {
    const error = new Error();
    if (!req.header('authorization')) {
      error.message = 'Please make sure your request has an Authorization header';
      error.status = error.statusCode = 401;
      throw error;
    }
    var token = req.header('Authorization').split(' ')[1];
    var payload = null;
    try {
      payload = jwt.decode(token, process.env.TOKEN_SECRET);
    }
    catch (err) {
      error.message = err.message;
      error.status = error.statusCode = 401;
      throw error;
    }
  
    if (payload.exp <= moment().unix()) {
      error.message = 'Token has expired';
      error.status = error.statusCode = 401;
      throw error;
    }
    User.findOne({'_id': payload.sub}, function(err, user) {
      if(err) {
        error.message = err;
        error.status = error.statusCode = 500;
        throw error;
      }
      if(!user) {
        error.message = 'No user found for the token';
        error.status = error.statusCode = 401;
        throw error;
      }
      req.user = user;
      return next();
    });
}

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createJWT(user) {
    var payload = {
      sub: user._id,
      iat: moment().unix(),
      exp: moment().add(14, 'days').unix()
    };
    return jwt.encode(payload, process.env.TOKEN_SECRET);
}

/*
 |--------------------------------------------------------------------------
 | GET /api/profile
 |--------------------------------------------------------------------------
 */
exports.get = function (req, res) {
  User.findById(req.user, function(err, user) {
    res.send(user);
  });
};

/*
 |--------------------------------------------------------------------------
 | PUT /api/me
 |--------------------------------------------------------------------------
 */
exports.put = function(req, res) {
  User.findById(req.body, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }
    user.displayName = req.body.displayName || user.displayName;
    user.dni = req.body.dni || user.dni;
    if(req.body.password){
      user.password = req.body.password;
    }
    user.save(function(err) {
      if (err) {
        res.status(500).send({ message: err.message });
      }
      res.send({message: "OK"});
    });
  });
};

/*
 |--------------------------------------------------------------------------
 | Log in with DNI
 |--------------------------------------------------------------------------
 */
exports.login = function(req, res) {

  User.findOne({ dni: req.body.dni }, '+password', function(err, user) {
    if (!user) {
      return res.status(401).send({ message: 'Invalid dni and/or password' });
    }
    user.comparePassword(req.body.password, function(err, isMatch) {
      if (!isMatch) {
        return res.status(401).send({ message: 'Invalid dni and/or password' });
      }
      res.send({ token: 'basic ' + createJWT(user) });
    });
  });
};

/*
 |--------------------------------------------------------------------------
 | Create DNI and Password Account
 |--------------------------------------------------------------------------
 */
exports.signup = function(req, res) {
  User.findOne({ dni: req.body.dni }, function(err, existingUser) {
    if (existingUser) {
      return res.status(409).send({ message: 'DNI is already taken' });
    }
   var user = new User({
      displayName: req.body.displayName,
      dni: req.body.dni,
      password: req.body.password
    });
    user.save(function(err, result) {
      if (err) {
        res.status(500).send({ message: err.message });
      }
      res.send({ token: createJWT(result) });
    });
  });
};

/*
 |--------------------------------------------------------------------------
 | GET /api/getAll
 |--------------------------------------------------------------------------
 */
exports.getAll = function (req, res) {
  User.find({}, function(err, users) {
    res.send(users);
  });
};

/*
 |--------------------------------------------------------------------------
 | GET /api/delete -- Delete user with cascade (user)
 |--------------------------------------------------------------------------
 */
exports.delete = function(req, res) {
  User.findOne({ _id: req.swagger.params.id.value }, function(err, user){
    if(err){
      return res.status(500).send({ message: err.message });
    }
    user.remove(function(err){
      if(err){
        return res.status(500).send({ message: err.message });
      }
      return res.send({message: 'OK'});
    });  
    
  });
};

/*
 |--------------------------------------------------------------------------
 | GET /api/update -- Update user roles
 |--------------------------------------------------------------------------
 */
exports.putUserRoles = function(req, res) {
  User.findById(req.body, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }
    user.roles = req.body.roles || user.roles;
   user.save(function(err) {
      if (err) {
        res.status(500).send({ message: err.message });
      }
      res.send({message: "OK"});
    });
  });
};