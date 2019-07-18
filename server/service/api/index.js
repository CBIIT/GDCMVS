'use strict';

const express = require('express');
const controller = require('./../search/search.controller');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../config/swagger');

const router = express.Router();

router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(swaggerDocument));

router.get('/search', controller.searchAPI);

module.exports = router;
