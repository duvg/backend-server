// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
    next();
});

// Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoute = require('./routes/login');
var hospitalRoute = require('./routes/hospital');
var medicoRoute = require('./routes/medico');
var busquedaRoute = require('./routes/busqueda');
var uploadRoute = require('./routes/upload');
var imagenesRoute = require('./routes/imagenes');



// Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');

});


// Serve index config
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Rutas
// Usuarios
app.use('/usuario', usuarioRoutes);

// Autenticacion
app.use('/login', loginRoute);

// Hospitales
app.use('/hospital', hospitalRoute);

// Medicos
app.use('/medico', medicoRoute);

// Búsqueda
app.use('/busqueda', busquedaRoute);

// Carga de archivos
app.use('/upload', uploadRoute);

// Imagenes
app.use('/img', imagenesRoute);

// ruta raiz
app.use('/', appRoutes);





// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});