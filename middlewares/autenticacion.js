var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// =====================================
// Middleware para verificar token
// =====================================

exports.verificaToken = function(req, res, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }


        req.usuario = decoded.usuario;

        next();
        // res.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });
    });
}
// =====================================
// Middleware para verificar el rol
// =====================================
// 
exports.verificaAdminRole = function(req, res, next) {
        
    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto',
            errors: { mesage: 'Acceso denegado!'}
        });
    }
}


// =====================================
// Middleware para verificar si es el 
// mismo usuario
// =====================================

exports.verificaAdmin_MismoUsuario = function(req, res, next) {
        
    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No eres el mismo usuario',
            errors: { mesage: 'Acceso denegado!'}
        });
    }
}