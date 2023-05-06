const express = require('express');
const path = require('path')

global.__basedir = __dirname;

// conecting to server
const app = require('./config/custom-express');

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000...')
});

// conecting to db
const db = require("./config/db");

db.mongoose
  .connect(db.url)
  .then(() => {
    console.log("Conexão com o banco de dados realizada com sucesso!");
  })
  .catch(err => {
    console.log("Não foi possível conectar ao banco de dados!", err);
    process.exit();
  });
