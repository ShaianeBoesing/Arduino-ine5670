const ArduinoHistory = require('../models/ArduinoHistory');
const ConnectionTypes = require('../models/ConnectionTypes');

const net = require('net');

exports.index = function(req, res) {
    res.send("Hello world");
};

exports.writeIntensity = function(req, res) {
    const intensity = req.params.INTENSITY;

    if (intensity >= 0 && intensity <= 255) {
      const mensagem = `${intensity}`;
  
      arduinoConnect(req, mensagem);
  
      res.send(`Mensagem enviada para alterar a intensidade do LED para ${intensity}.`);
    } else {
      res.status(400).send('A intensidade deve ser um valor entre 0 e 255.');
    }
};

exports.writeMorse = function(req, res) {

    const morse = req.params.MORSE;

    const mensagem = `${morse}`;

    const regex = /^[a-zA-Z]+$/;

    if (regex.test(morse)) {
        arduinoConnect(req, mensagem);
        res.send(`Mensagem enviada para escrever em morse ${morse}.`);
    } else {
        res.status(400).send('A mensagem deve conter apenas letras e números.');
    }
};

exports.setState = function(req, res) {

    const setState = req.params.SET_STATE;

    const mensagem = `${setState}`;

    const regex = /^(on|off)$/;

    if (regex.test(setState)) {
        arduinoConnect(req, mensagem);
        res.send(`Mensagem enviada para mudar o estado do led para ${setState}.`);
    } else {
        res.status(400).send('A mensagem deve conter apenas "on" ou "off".');
    }
};

exports.getState = function(req, res) {
    arduinoConnect(req, null, (error, data) => {
        if (error) {
            console.error(error);
            res.status(500).send(`Ocorreu um erro ao se comunicar com o Arduino: ${error}`);
        } else {
            res.send(`O led está ${data}.`);
        }
    });
};

exports.history = async function(req, res) {
    ArduinoHistory.find({}, {type: 1, value: 1, createdAt: 1, _id: 0})
    .sort({createdAt: -1})
    .then((results) => {
        res.send(results);
    })
    .catch((error) => {
        console.log(`Erro ao buscar histórico do Arduino: ${error}`);
    });
}

function reqType(req) {
    return ConnectionTypes[Object.keys(req.params)[0]]
}

function arduinoConnect(req, value=null, callback) {
    const arduinoIP = '192.168.3.193';
    const arduinoPort = 80;
    let type = reqType(req)

    const arduinoSocket = net.connect({ host: arduinoIP, port: arduinoPort }, () => {
        console.log('Conexão estabelecida com o Arduino!');
    });


    let receivedData = '';

    arduinoSocket.on('connect', () => {
        let url = `GET /${type}`;
        if (value) {
            url = url.concat(`=${value}`);
        }
        url = url.concat(' HTTP/1.1\r\n\r\n');
        document.write(url)
        arduinoSocket.write(url);
    });

    arduinoSocket.on('data', (data) => {
        receivedData += data.toString();
    });

    arduinoSocket.on('end', () => {
        console.log('Conexão finalizada com o Arduino.');
        console.log(`Dados recebidos: ${receivedData}`);
        ArduinoHistory.create({"type": type, "value": value})
        callback(null, receivedData);
    });

    arduinoSocket.on('error', (error) => {
        console.error(`Erro ao conectar com o Arduino: ${error}`);
        callback(error, null);
    });
}

