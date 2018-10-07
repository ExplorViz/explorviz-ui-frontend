/* eslint-env node */
'use strict';

module.exports = function(app) {
  const express = require('express');
  let tokensRouter = express.Router();

  const token = {token : "dummy-token"};

  tokensRouter.post('/refresh', function(req, res) {
    res.send(token);
  });

  tokensRouter.post('/', function(req, res) {
    res.send(token);
  });

  // The POST and PUT call will not contain a request body
  // because the body-parser is not included by default.
  // To use req.body, run:

  //    npm install --save-dev body-parser

  // After installing, you need to `use` the body-parser for
  // this mock uncommenting the following line:
  //
  //app.use('/api/tokens', require('body-parser').json());
  app.use('/api/v1/tokens', tokensRouter);
};