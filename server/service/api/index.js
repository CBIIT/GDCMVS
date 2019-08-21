'use strict';

const express = require('express');
const controller = require('./../search/search.controller');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../config/swagger');

const router = express.Router();

router.get('/', function (req, res) {
  res.json({
    'version': '1.3.0',
    'title': 'GDCMVS Rest API',
    'description': req.protocol + '://' + req.headers.host + req.baseUrl,
    'documentation': req.protocol + '://' + req.headers.host + req.baseUrl + '/docs/'
  });
});

router.use('/docs',
  swaggerUi.serve,
  function (req, res) {
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = req.baseUrl !== undefined ? req.baseUrl.replace(/\/docs/g, '') : '';
    swaggerUi.setup(swaggerDocument(protocol, host, baseUrl))(req, res);
  }
);

router.get('/search', controller.searchAPI);

module.exports = router;
