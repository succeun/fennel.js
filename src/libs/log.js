/*-----------------------------------------------------------------------------
 **
 ** - Fennel Card-/CalDAV -
 **
 ** Copyright 2014-16 by
 ** SwordLord - the coding crew - http://www.swordlord.com
 ** and contributing authors
 **
 -----------------------------------------------------------------------------*/

var log4js = require('log4js');
var log = log4js.getLogger("fennelapp");

log4js.configure('log4js.json');

function initialise()
{
    log.debug("logger loaded");
}

// Exporting.
module.exports = {
    log: log
};

initialise();
