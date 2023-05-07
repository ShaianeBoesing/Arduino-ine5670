const routes = require('express').Router();
const arduino = require('./controllers/arduino_controller');

// Login
routes.get('/', arduino.index);
routes.get('/led/:intensity', arduino.writeIntensity);
routes.get('/morse/:morse', arduino.writeMorse);

module.exports = routes;
