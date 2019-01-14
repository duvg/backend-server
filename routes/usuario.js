var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

// requerir modelo de usuairo
var Usuario = require('../models/usuario');

//=====================================
// Obtener todos los usuarios
//=====================================
app.get('/', (req, res, next) => {

    //busqueda de los usuarios
    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                // validar si existen errores
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                // respuesta con todos los usuarios
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                })
            });

});



// =====================================
// Crear un nuevo usuario
// =====================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    // recivir el cuerpor del la peticion
    var body = req.body;

    // crear un nuevo usuario
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    //guardar el nuevo usuario
    usuario.save((err, usuarioGuardado) => {
        // validamos los errores
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando el usuario',
                error: err
            });
        }

        // retornamos la respuesta del usuario creado
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });
});

// =====================================
// Actualizar usuario
// =====================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error! al buscar al usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error! usuario con id: ' + id + " no existe",
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            })
        });


    });
})


// =====================================
// Eliminar usuario
// =====================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usaurioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                messaje: 'Error al eliminar usuario de la base de datos',
                erros: err
            });
        }

        if (!usaurioBorrado) {
            return res.status(400).json({
                ok: false,
                messaje: 'No existe un usuario con ese id',
                error: { message: 'No existe un usuario con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usaurioBorrado
        });
    });
});

module.exports = app;