var log4js = require("log4js");
var log = log4js.getLogger("requesthandler");

var principal = require("../handler/principal");
var cal = require("../handler/calendar");
var card = require("../handler/addressbook");

function notYet(request) {
    var method = request.getReq().method;
    var res = request.getRes();
    log.info("Request method is unknown: " + method);
    res.writeHead(500);
    res.write(method + " is not implemented yet");
}

function handlePrincipal(request) {
    // check if root url or cal or card url
    var method = request.getReq().method;
    switch (method) {
        case "PROPFIND": principal.propfind(request); break;
        case "PROPPATCH": principal.proppatch(request); break;
        case "OPTIONS": principal.options(request); break;
        case "REPORT": principal.report(request); break;
        //case "HEAD": principal.head(request); break;
        default: notYet(request); break;
    }
    log.info("--------------------------- handlePrincipal");
}

function handleCalendar(request) {
    var method = request.getReq().method;
    switch (method) {
        case "PROPFIND": cal.propfind(request); break;
        case "PROPPATCH": cal.proppatch(request); break;
        case "OPTIONS": cal.options(request); break;
        case "REPORT": cal.report(request); break;
        case "MKCALENDAR": cal.makeCalendar(request); break;
        case "PUT": cal.put(request); break;
        case "GET": cal.get(request); break;
        case "DELETE": cal.delete(request); break;
        case "MOVE": cal.move(request); break;
        default: notYet(request); break;
    }
    log.info("--------------------------- handleCalendar");
}

function handleCard(request) {
    var method = request.getReq().method;
    switch (method) {
        case "PROPFIND": card.propfind(request); break;
        case "PROPPATCH": card.proppatch(request); break;
        case "OPTIONS": card.options(request); break;
        case "REPORT": card.report(request); break;
        case "PUT": card.put(request); break;
        case "GET": card.get(request); break;
        case "DELETE": card.delete(request); break;
        case "MOVE": card.move(request); break;
        default: notYet(request); break;
    }
    log.info("--------------------------- handleCard");
}

module.exports = {
    handlePrincipal: handlePrincipal,
    handleCalendar: handleCalendar,
    handleCard: handleCard,
};
