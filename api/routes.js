const routes = require('express').Router();
const arduino = require('./controllers/arduino_controller');

routes.get('/', arduino.index);
routes.get('/intensity/:INTENSITY', arduino.writeIntensity);
routes.get('/morse/:MORSE', arduino.writeMorse);
routes.get('/setState/:SET_STATE', arduino.setState);
routes.get('/getState', arduino.getState);
routes.get('/history', arduino.history);

module.exports = routes;
