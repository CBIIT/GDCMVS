const express = require('express');
const config = require('./config');
const logger = require('./components/logger');
const app = express();

require('./config/express')(app);
require('./routes')(app);

app.listen(config.port, () => {
  logger.info('GDCMVS listening on port :' + config.port);
});
