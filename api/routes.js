const routes = require('express').Router();
const arduino = require('./controllers/arduino_controller');

// Login
routes.get('/', arduino.index);
routes.get('/led/:intensity', arduino.changeIntensity);

module.exports = routes;
