var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// carga de confioguracion del seed
var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;

var app = express();
var Usuario = require('../models/usuario');

// Google 
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


var mdAutenticacion = require('../middlewares/autenticacion');

// =====================================
// Renovar el token del usuario
// =====================================
app.get('/renuevatoken', mdAutenticacion.verificaToken, ( req, res) => {

    var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 }); // duración de 4 horas

    res.status(200).json({
        ok: true,
        usuario: req.usuario,
        token: token
    });
});

// =====================================
// Autenticación de Google
// =====================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no valido'
            });
        });

    // Salvar usuario personalizado en la base de datos 
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Ya existe una cuenta con este email, debe usar su autentocacon normal',
                    errors: err
                });
            } else {
                // Crear un token
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // duracion de 4 horas

                // respuesta de usuario logueado
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });
            }
        } else {
            // El usuario no existe hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = 'XD';

            usuario.save((err, usuarioGuardado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        messaje: 'Error al crear el usuario',
                        errors: err
                    });
                }


                // Crear un token
                var token = jwt.sign({ usuario: usuarioGuardado }, SEED, { expiresIn: 14400 }); // duracion de 4 horas

                // respuesta de usuario logueado
                res.status(200).json({
                    ok: true,
                    usuario: usuarioGuardado,
                    token: token,
                    googleUser: googleUser,
                    menu: obtenerMenu(usuarioGuardado.role)
                });
            });
        }
    });
});

// =====================================
// Autenticación normal
// =====================================
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
                mensaje: 'Credenciales invalidas',
                errors: err
            });
        }

        // validar la contraseña
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales invalidas',
                errors: err
            });
        }

        usuarioDB.password = 'XD';
        // Crear un token
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // duracion de 4 horas

        // respuesta de usuario logueado
        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id,
            menu: obtenerMenu(usuarioDB.role)
        });
    });


});

function obtenerMenu(ROLE) {

    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Graficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'Rxjs', url: '/rxjs' },
            ]
        },
        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-locl-open',
            submenu: [
                //{ titulo: 'Usuarios', url: '/usuarios'},
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Medicos', url: '/medicos' },
            ]
        }
    ];

    if (ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }

    return menu;
}


module.exports = app;