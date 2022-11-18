var config = require('./config').config;
var authlib = require('./src/libs/authentication');
var http = require('http');
var url = require('url');
var log = require('./src/libs/log').log;
var handler = require('./src/libs/requesthandler');

var communication = require('./src/libs/communication');
var httpauth = require('http-auth');

var crossroads = require('crossroads');
crossroads.ignoreState = true;

var basic = httpauth.basic(
    {
        realm: "Fennel"
    }, function (username, password, callback)
    {
        authlib.checkLogin(basic, username, password, callback);
    }
);

crossroads.addRoute('/p/:params*:', (comm, params) => {
    comm.params = params;

    // check authorisation
    // if(!comm.checkPermission(comm.getURL(), comm.getReq().method))
    // {
    //     var res = comm.getRes();
    //     log.info("Request is denied to this user");
    //     res.writeHead(403);
    //     res.write("Request is denied to this user");
    //     return;
    // }

    handler.handlePrincipal(comm);
});

crossroads.addRoute('/cal/:username:/:cal:/:params*:', (comm, username, cal, params) => {
    comm.username = username;
    comm.cal = cal;
    comm.params = params;

    // check authorisation
    if(!comm.checkPermission(comm.getURL(), comm.getReq().method))
    {
        var res = comm.getRes();
        log.info("Request is denied to this user");
        res.writeHead(403);
        res.write("Request is denied to this user");
        return;
    }
    handler.handleCalendar(comm);
});

crossroads.addRoute('/card/:username:/:card:/:params*:', (comm, username, card, params) => {
    comm.username = username;
    comm.card = card;
    comm.params = params;

    // check authorisation
    if(!comm.checkPermission(comm.getURL(), comm.getReq().method)) {
        var res = comm.getRes();
        log.info("Request is denied to this user");
        res.writeHead(403);
        res.write("Request is denied to this user");
        return;
    }
    handler.handleCard(comm);
});

crossroads.addRoute('/.well-known/:params*:', (comm, params) => {
    log.debug("Called .well-known URL for " + params + ". Redirecting to /p/");
    comm.getRes().writeHead(302, {
            'Location': '/p/'
            //todo: add other headers here...?
        });
    comm.flushResponse();
});

crossroads.addRoute('/', (comm) => {
    log.debug("Called the root. Redirecting to /p/");
    comm.getRes().writeHead(302, {
            'Location': '/p/'
            //todo: add other headers here...?
        });
    comm.flushResponse();
});

crossroads.bypassed.add((comm, path) =>  {
    log.info('URL unknown: ' + path);
    var res = comm.getRes();
    res.writeHead(500);
    res.write(comm.url + " is not known");
    res.end();
});

// start the server and process requests
var server = http.createServer(basic, function (req, res)
{
    log.debug("======================== Method: " + req.method + ", URL: " + req.url);
    log.debug("================ Header: ", JSON.stringify(req.headers, null, 2));

    // will contain the whole body submitted
	var reqBody = "";

    req.on('data', function (data)
    {
        reqBody += data.toString();
    });

    req.on('end',function()
    {
        var comm = new communication(req, res, reqBody);

        var sUrl = url.parse(req.url).pathname;
        log.debug("Request body: " + reqBody);
        crossroads.parse(sUrl, [comm]);
    });
});

server.listen(config.port);

server.on('error', function (e)
{
    log.warn('Caught error: ' + e.message);
    log.debug(e.stack);
});

process.on('uncaughtException', function(err)
{
    log.warn('Caught exception: ' + err.message);
    log.debug(err.stack);
});

// Put a friendly message on the terminal
log.info("Server running at http://" + config.ip + ":" + config.port + "/");
