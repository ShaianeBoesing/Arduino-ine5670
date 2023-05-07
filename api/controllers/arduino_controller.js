const net = require('net');

exports.index = function(req, res) {
    res.send("Hello world");
};

exports.writeIntensity = function(req, res) {
    const intensity = req.params.intensity;
  
    if (intensity >= 0 && intensity <= 255) {
      const mensagem = `${intensity}\n`;
  
      arduinoConnect(req, mensagem);
  
      res.send(`Mensagem enviada para alterar a intensidade do LED para ${intensity}.`);
    } else {
      res.status(400).send('A intensidade deve ser um valor entre 0 e 255.');
    }
};

exports.writeMorse = function(req, res) {

    const morse = req.params.morse;

    const mensagem = `${morse}\n`;

    const regex = /^[a-zA-Z]+$/;

    if (regex.test(morse)) {
        arduinoConnect(req, mensagem);
        res.send(`Mensagem enviada para escrever em morse ${morse}.`);
    } else {
        res.status(400).send('A mensagem deve conter apenas letras e números.');
    }
};

exports.changeState = function(req, res) {

    const state = req.params.state;

    const mensagem = `${state}\n`;

    const regex = /^(on|off)$/;

    if (regex.test(state)) {
        arduinoConnect(req, mensagem);
        res.send(`Mensagem enviada para mudar o estado do led para ${state}.`);
    } else {
        res.status(400).send('A mensagem deve conter apenas "on" ou "off".');
    }
};

function reqType(req) {
    const mapping = {
        morse: 'morse',
        intensity: 'intensity',
        state: 'state'
    };
    const value = Object.keys(req.params).find(value => mapping[value]);
    return mapping[value];
}

function arduinoConnect(req, value) {
    const arduinoIP = '192.168.3.193';
    const arduinoPort = 80;

    const arduinoSocket = net.connect({ host: arduinoIP, port: arduinoPort }, () => {
        console.log('Conexão estabelecida com o Arduino!');
    });
    console.log(`GET /${reqType(req)}=${value} HTTP/1.1\r\n\r\n`)

    arduinoSocket.on('connect', () => {
        arduinoSocket.write(`GET /${reqType(req)}=${value} HTTP/1.1\r\n\r\n`);
        arduinoSocket.end();
    });

    arduinoSocket.on('data', (data) => {
        console.log(`Mensagem recebida do Arduino: ${data}`);
    });

    arduinoSocket.on('error', (error) => {
        console.error(`Erro ao conectar com o Arduino: ${error}`);
    });
}

