var log4js = require('log4js');
var log = log4js.getLogger("fennelapp");

log4js.configure('log4js.json');

log.debug("logger loaded");

module.exports = {
    log: log
};
