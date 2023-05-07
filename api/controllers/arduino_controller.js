const net = require('net');

exports.index = function(req, res) {
    res.send("Hello world");
};

exports.changeIntensity = function(req, res) {
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

function arduinoConnect(arduinoIP, arduinoPort, mensagem) {
    const arduinoSocket = net.connect({ host: arduinoIP, port: arduinoPort }, () => {
      console.log('Conexão estabelecida com o Arduino!');
    });
  
    arduinoSocket.on('connect', () => {
      arduinoSocket.write(mensagem);
  
      arduinoSocket.end();
    });
  
    arduinoSocket.on('data', (data) => {
      console.log(`Mensagem recebida do Arduino: ${data}`);
    });
  
    arduinoSocket.on('error', (error) => {
      console.error(`Erro ao conectar com o Arduino: ${error}`);
    });
  }
  
  