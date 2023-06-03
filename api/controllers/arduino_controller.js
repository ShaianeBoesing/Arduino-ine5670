const ArduinoHistory = require('../models/ArduinoHistory');

const net = require('net');

exports.index = function (req, res) {
    res.send("Hello world");
};

exports.writeIntensity = async function (req, res) {
    const intensity = req.params.INTENSITY;

    if (intensity >= 0 && intensity <= 255) {
        const mensagem = `${intensity}`;
        try {
            await arduinoConnect(req, mensagem);
            res.send(`Mensagem enviada para alterar a intensidade do LED para ${intensity}.`);
        } catch (error) {
            console.log(error)
            res.status(500).send(ArduinoConnectionError());
        }
    } else {
        res.status(400).send('A intensidade deve ser um valor entre 0 e 255.');
    }
};

exports.writeMorse = async function (req, res) {

    const morse = req.params.MORSE;

    const mensagem = `${morse}`;

    const regex = /^[a-zA-Z\s]+$/;

    if (regex.test(morse)) {
        try {
            await arduinoConnect(req, mensagem.replace(" ", "%20"));
            res.send(`Mensagem enviada para escrever em morse ${morse}.`);
        } catch (error) {
            console.log(error)
            res.status(500).send(ArduinoConnectionError());
        }
    } else {
        res.status(400).send('A mensagem deve conter apenas letras.');
    }
};

exports.setState = async function (req, res) {

    const setState = req.params.SET_STATE;

    const mensagem = `${setState}`;

    const regex = /^(on|off)$/;

    if (regex.test(setState)) {
        try {
            await arduinoConnect(req, mensagem);
            res.send(`Mensagem enviada para mudar o estado do led para ${setState}.`);
        } catch (error) {
            console.log(error)
            res.status(500).send(ArduinoConnectionError());
        }
    } else {
        res.status(400).send('A mensagem deve conter apenas "on" ou "off".');
    }
};

exports.getState = async function (req, res) {
    try {
        result = await arduinoConnect(req);
        if (result.hasOwnProperty('data')) {
            res.send(`O led está ${result['data']}.`);
        }
    } catch (error) {
        console.log(error)
        res.status(500).send(ArduinoConnectionError());
    }
};

exports.history = async function (req, res) {
    ArduinoHistory.find({}, { type: 1, value: 1, createdAt: 1, _id: 0 })
    .sort({ createdAt: -1 })
    .then((results) => {
        res.json(results);
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send(DatabaseConnectionError());
    });
}

function arduinoConnect(req, value = null, callback) {
    return new Promise((resolve, reject) => {
        // const arduinoIP = "192.168.3.193";
        const arduinoIP = "172.20.10.6";
        const arduinoPort = 80;
        let type = reqType(req);

        const arduinoSocket = net.connect({ host: arduinoIP, port: arduinoPort }, () => {
            console.log("Conexão estabelecida com o Arduino!");
            let url = `GET /${type}`;
            if (value) {
                url = url.concat(`=${value}`);
            }
            url = url.concat(" HTTP/1.1\r\n\r\n");
            arduinoSocket.write(url);
        });

        let receivedData = "";

        arduinoSocket.on("data", (data) => {
            receivedData += data.toString();
        });

        arduinoSocket.on("end", () => {
            console.log("Conexão finalizada com o Arduino.");
            console.log(`Dados recebidos: ${receivedData}`);
            ArduinoHistory.create({ type: type, value: value });
            resolve({ data: receivedData });
        });

        arduinoSocket.on("error", (error) => {
            console.error(`Erro ao conectar com o Arduino: ${error}`);
            reject({ error: error });
        });
    });
}

function reqType(req) {
    return req.originalUrl.split('/')[1];
}

function ArduinoConnectionError() {
    return "Ocorreu um erro ao comunicar com o Arduino"
}

function DatabaseConnectionError() {
    return "Ocorreu um erro ao comunicar com o Banco de Dados"
}