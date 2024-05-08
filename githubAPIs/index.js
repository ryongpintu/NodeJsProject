const express = require('express');
const winston = require('winston');
const app = express();

const bodyParser = require('body-parser');

app.use(bodyParser.json());
require('./startup/routes')(app);
require('./startup/db')();

app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 8000;
const server = app.listen(port, () => winston.info(`Hi i am listing to port ${port}`));
module.exports = server;
