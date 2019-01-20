var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();
var Hospital = require('../models/hospital');

// =====================================
// Obtener todos los hospitales
// =====================================

app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    //Búsqueda de todos los hospitales
    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                // Validar si existen errores
                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando los hospitales',
                        errors: err
                    });
                }

                Hospital.count((err, conteo) => {
                    // Respuesta con todos los hospitales
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                });

            });
});


// =====================================
// Buscar un hospital por el id
// =====================================
app.get('/:id', (req, res) => {
    var id = req.params.id;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error hospital no encontrado',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error!, el hospital con id: ' + id + ' no existe',
                errors: { message: 'Error!, el hospital con id: ' + id + ' no existe'}
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospital
        });
    })
});

// =====================================
// Crear un nuevo hospital
// =====================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    // Recolectar el cuerpo de la petición
    var body = req.body;

    // Crear el nuevo hospital
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    // Guardar el nuevo hospital
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: true,
                mensaje: 'Error creando el hospital',
                errors: err
            });
        }

        // Retornode la respuesta con el hospital creado
        res.status(201).json({
            ok: true,
            hospital: hospital
        });
    });

});

// =====================================
// Actualizar hospital
// =====================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    // recolecciond el id de la peticion
    var id = req.params.id;
    var body = req.body;

    // Búsqueda del hospital por id
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error! hospital no encontrado',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error!, el hospital con id: ' + id + ' no existe',
                errors: { message: 'No existe ningun hospital con ese ID' }
            });
        }

        // Actualizamos los datos del hospital
        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        });

    });
});


// =====================================
// Eliminar hospital
// =====================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    // Recolectamos el id 
    var id = req.params.id;

    // Eliminamos el hospital
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar el hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error!, no existe un hospital con ese ID',
                errors: { message: 'Error!, no existe un hospital con ese ID' }
            });
        }

        // Retornamos el hospital eliminado
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });
});

module.exports = app;