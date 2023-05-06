const express = require('express');
const app = express();

var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const routes = require('../api/routes');
app.use('/', routes);

module.exports = app;
