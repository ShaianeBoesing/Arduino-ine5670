const routes = require('express').Router();
const arduino = require('./controllers/arduino_controller');

// Login
routes.get('/', arduino.index);
routes.get('/intensity/:intensity', arduino.writeIntensity);
routes.get('/morse/:morse', arduino.writeMorse);
routes.get('/state/:state', arduino.changeState);

module.exports = routes;
