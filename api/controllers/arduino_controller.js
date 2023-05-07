const net = require('net');

exports.index = function(req, res) {
    res.send("Hello world");
};

exports.writeIntensity = function(req, res) {
    const arduinoIP = '192.168.3.193';
    const arduinoPort = 80;
  
    const intensity = req.params.intensity;
  
    if (intensity >= 0 && intensity <= 255) {
      const mensagem = `${intensity}\n`;
  
      arduinoConnect(arduinoIP, arduinoPort, mensagem);
  
      res.send(`Mensagem enviada para alterar a intensidade do LED para ${intensity}.`);
    } else {
      res.status(400).send('A intensidade deve ser um valor entre 0 e 255.');
    }
};

exports.writeMorse = function(req, res) {
    const arduinoIP = '192.168.3.193';
    const arduinoPort = 80;

    const morse = req.params.morse;

    const mensagem = `${morse}\n`;

    const regex = /^[a-zA-Z0-9]+$/;

    if (regex.test(morse)) {
        arduinoConnect(arduinoIP, arduinoPort, mensagem);
        res.send(`Mensagem enviada para escrever em morse ${morse}.`);
    } else {
        res.status(400).send('A mensagem deve conter apenas letras e números.');
    }
};

function arduinoConnect(arduinoIP, arduinoPort, intensity) {
    const arduinoSocket = net.connect({ host: arduinoIP, port: arduinoPort }, () => {
        console.log('Conexão estabelecida com o Arduino!');
    });

    arduinoSocket.on('connect', () => {
        arduinoSocket.write(`GET /intensity=${intensity} HTTP/1.1\r\n\r\n`);
        arduinoSocket.end();
    });

    arduinoSocket.on('data', (data) => {
        console.log(`Mensagem recebida do Arduino: ${data}`);
    });

    arduinoSocket.on('error', (error) => {
        console.error(`Erro ao conectar com o Arduino: ${error}`);
    });
}
