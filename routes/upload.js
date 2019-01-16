// Importaciones
var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

// Importamos los models
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// Default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    // Recolectamos los parametros
    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de coleccion 
    var tiposColeccion = ['hospitales', 'medicos', 'usuarios'];

    if (tiposColeccion.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: true,
            mensaje: 'Tipo de coleccion no valida',
            errors: { message: 'Los tipos de coleccion validos son: ' + tiposColeccion.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error no se han cargado archivos',
            errors: { message: 'Error no se han cargado archivos' }
        });
    }

    // Obtener nombre de archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Extensiones permitidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    // Validar la extension
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error! Esta extension de archivo no esta permitida',
            errors: { message: 'Ls extensiones valias son: ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre personalizado de imagen
    var nombreImagen = `${ id }-${ new Date().getMilliseconds() }.${extensionArchivo}`;


    // Mover el archivo de la carpeta temporal a la carpeta del servidor
    var path = `./uploads/${ tipo }/${nombreImagen}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreImagen, res)

    });

});

function subirPorTipo(tipo, id, nombreImagen, res) {
    var Modelo;
    var tipoModelo = tipo.slice(0, -1);

    if (tipo === 'usuarios') {
        Modelo = Usuario;
    }
    if (tipo === 'medicos') {
        Modelo = Medico;
    }
    if (tipo === 'hospitales') {
        Modelo = Hospital;
    }

    Modelo.findById(id, (err, modelo) => {

        if (!modelo) {
            return res.status(500).json({
                ok: false,
                mensaje: `${tipoModelo} no encontrado`,
                errors: { message: `No existe un  ${tipoModelo} con el id: ${id}` }
            });
        }

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: `Error al buscar ${tipoModelo} `,
                errors: err
            });
        }

        // verificamos si posee una imagen
        var pathAnterior = `./uploads/${tipo}/${modelo.img}`;

        // Si existe una miagen la eliminamos
        if (fs.existsSync(pathAnterior)) {
            fs.unlink(pathAnterior);
        }



        modelo.img = nombreImagen;

        modelo.save((err, modeloActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar la imagen',
                    errors: err
                });
            }
            return res.status(200).json({
                ok: true,
                mensaje: `Imagen del ${tipoModelo} actualizada`,
                [tipoModelo]: modeloActualizado
            });
        });
    });
}


module.exports = app;