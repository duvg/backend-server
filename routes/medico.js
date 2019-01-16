var express = require('express');

// Carga de la autenticacion por token
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

// Requerimos el modelo
var Medico = require('../models/medico');

// =====================================
// Obtenemos todos los medicos
// =====================================

app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'No se encontraron medicos',
                    errors: err
                });
            }
            Medico.count((err, conteo) => {
                // Retornamos la respuesta
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });

        })
});

// =====================================
// Crear medico
// =====================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    // Recoleccion del cuerpo de la petición
    var body = req.body;



    // Crear el medico
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    // Guardar el nuevo medico
    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando el medico',
                errors: err
            });
        }

        // Retornamos las respuesta con el medico creado
        res.status(201).json({
            ok: true,
            medico: medico
        });
    });
});

// =====================================
// Actualizar medico
// =====================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    // Recolectamos el id
    var id = req.params.id;

    // Recolectamos el cuerpo de la petición
    var body = req.body;

    // Búscamos el medico por id
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Medico no encontrado',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error el medico con el id: ' + id + ' no existe!',
                errors: { message: 'Error el medico con el id: ' + id + ' no existe!' }
            });
        }

        // Actualizamos los datos del medico
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        // Guardamos los cambios
        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar los datos del medico',
                    erros: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });
    });
});


// =====================================
// Eliminar medico
// =====================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    // Recolectamos el id
    var id = req.params.id;

    //Buscamos y eliminamos el registro
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error la eliminar el medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id: ' + id + ' no existe!',
                errors: { message: 'El medico con el id: ' + id + ' no existe!' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});


module.exports = app;