'use strict';

const express = require('express');
const controller = require('./../search/search.controller');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../config/swagger');

const router = express.Router();

router.get('/', function (req, res) {
  res.json({
    'version': '1.0.0',
    'title': 'GDCMVS Rest API',
    'documentation': 'https://' + req.headers.host + '/gdc/api/v1/docs/'
  });
});

router.use('/docs',
  swaggerUi.serve,
  function (req, res) {
    const protocol = 'https';
    const host = req.get('host');
    const baseUrl = '/gdc/api/v1';
    swaggerUi.setup(swaggerDocument(protocol, host, baseUrl))(req, res);
  }
);

router.get('/search', controller.searchAPI);

module.exports = router;
