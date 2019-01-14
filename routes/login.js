var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// carga de confioguracion del seed
var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');


app.post('/', (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                messaje: 'Error al buscar usuario',
                errors: err
            });
        }

        // validar si existe un usuario con ese correo
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales invalidas - email',
                errors: err
            });
        }

        // validar la contraseña
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales invalidas - password',
                errors: err
            });
        }

        usuarioDB.password = 'XD';
        // Crear un token
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // duracion de 4 horas


        // respuesta de usuario logueado
        res.status(200).json({
            ok: true,
            usaurio: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });


});


module.exports = app;