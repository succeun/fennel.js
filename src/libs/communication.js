var log = require("./log").log;
var config = require("../../config").config;

var userLib = require("./user");
var url = require("url");
var pd = require("pretty-data").pd;
// shiro-trie object for authorisation checks
var st = require("shiro-trie");



/**
 * generates a new request object, constructor like
 * @param req
 * @param res
 * @param reqBody
 * @returns {request}
 */
class comm {
    constructor(req, res, reqBody, session) {
        // request object as well as body
        this.req = req;
        this.reqBody = reqBody;

        // response object as well as body we gonna write ourselfs
        this.res = res;
        this.resBody = ""; // response body

        if (!session) {
            // get the user name from the authentication process
            var header = req.headers["authorization"] || ""; // get the header
            var token = header.split(/\s+/).pop() || ""; // and the encoded auth token
            var auth = Buffer.from(token, "base64").toString("utf8"); // convert from base64
            var parts = auth.split(/:/); // split on colon
            var username = parts[0];
            if (username) {
                this.user = new userLib.user(username);
            }
        } else {
            this.user = session;
        }

        this.authority = st.new();

        // get shiro-trie configuration from config file
        var arrAuthorisation = config.authorisation;

        for (var i = 0; i < arrAuthorisation.length; i++) {
            var el = arrAuthorisation[i];
            this.authority.add(el.replace("$username", username));
        }

        return this;
    }
    /**
     * pushes out the standard OPTIONS response headers and flushes the response
     */
    pushOptionsResponse() {
        log.debug("pushOptionsResponse called");

        // TODO comm.setstandardheader...
        this.setHeader("Content-Type", "text/html");
        this.setHeader("Server", "Fennel");

        this.setDAVHeaders();
        this.setAllowHeader();

        this.setResponseCode(200);
        this.flushResponse();
    }
    /**
     * Sets the response code given
     * @param responseCode
     */
    setResponseCode(responseCode) {
        log.info("Setting response code: " + responseCode);
        this.res.writeHead(responseCode);
    }
    /**
     * Writes out the body and sends a response.end
     */
    flushResponse() {
        // prettify XML when we have XML in the body
        var response = this.resBody;

        if (response.substr(0, 5) === "<?xml") {
            response = pd.xml(this.resBody);
        }

        log.debug("Returning response: " + response);
        this.res.write(response);
        this.res.end();
    }
    /**
     * Adds given string to the response body
     * @param str
     */
    appendResBody(str) {
        this.resBody += str;
    }
    /**
     * sets the Fennel Standard Headers in the response
     */
    setStandardHeaders() {
        this.res.setHeader("Content-Type", "application/xml; charset=utf-8");
        this.res.setHeader("Server", "Fennel");
        //res.setHeader("Cache-Control", "private, max-age=0");
        //res.setHeader("X-Content-Type-Options", "nosniff");
        //res.setHeader("X-Frame-Options", "SAMEORIGIN");
        //res.setHeader("X-XSS-Protection", "1; mode=block");
    }
    /**
     * sets the DAV Header in the response
     */
    setDAVHeaders() {
        this.res.setHeader(
            "DAV",
            "1, 3, extended-mkcol, calendar-access, calendar-schedule, calendar-proxy, calendarserver-sharing, calendarserver-subscribed, addressbook, access-control, calendarserver-principal-property-search"
        );
    }
    /**
     * sets the Allow Header in the response
     */
    setAllowHeader() {
        this.res.setHeader("Allow", "OPTIONS, PROPFIND, HEAD, GET, REPORT, PROPPATCH, PUT, DELETE, POST, COPY, MOVE");
    }
    setHeader(key, value) {
        this.res.setHeader(key, value);
    }
    /**
     *
     * @returns {userLib.user|user}
     */
    getUser() {
        return this.user;
    }
    /*
     comm.prototype.setUser = function(user)
    {
        this.user = user;
    };
    */
    getAuthority() {
        return this.authority;
    }
    /**
     * Give an URL and method and this function will tell you if this user is authorised to access that resource
     * @param strURL
     * @param strMethod
     * @returns {*}
     */
    checkPermission(strURL, strMethod) {
        // make sure to change the URL syntax to the shiro syntax
        // which means /my/url/ becomes my:url
        // that filter(String) hack makes sure that there are no empty elements,
        // like you get when splitting a / terminated URL...
        var s = strURL.substr(1).split("/").filter(String).join(":") + ":" + strMethod.toLowerCase();

        // have the shiro string checked against the authorisation set...
        var ret = this.authority.check(s);

        log.debug("Checking authority for user '" + this.getUser().getUserName() + "' for '" + s + "' with result: " + ret);

        return ret;
    }
    getReq() {
        return this.req;
    }
    getRes() {
        return this.res;
    }
    /**
     * returns the request body
     * @returns {*}
     */
    getReqBody() {
        return this.reqBody;
    }
    getResBody() {
        return this.resBody;
    }
    getURL() {
        return this.req.url;
    }
    getURLAsArray() {
        var aUrl = url.parse(this.req.url).pathname.split("/");
        if (aUrl.length <= 0) {
            log.warn("Something evil happened in comm.getUrlAsArray!");
            return undefined;
        }

        return aUrl;
    }
    getFilenameFromPath(removeEnding) {
        var aUrl = url.parse(this.req.url).pathname.split("/");
        if (aUrl.length <= 0) {
            log.warn("Something evil happened in request.getFilenameFromPath");
            return undefined;
        }

        var filename = aUrl[aUrl.length - 1];

        if (removeEnding) {
            filename = filename.substr(0, filename.length - 4);
        }

        return filename;
    }
    getLastPathElement() {
        var aUrl = url.parse(this.req.url).pathname.split("/");
        if (aUrl.length <= 0) {
            log.warn("Something evil happened in request.getLastPathElement");
            return undefined;
        }

        return aUrl[aUrl.length - 2];
    }
    getPathElement(position) {
        var aUrl = url.parse(this.req.url).pathname.split("/");
        if (aUrl.length <= 0) {
            log.warn("Something evil happened in request.getPathElement");
            return undefined;
        }

        return aUrl[position];
    }
    getUrlElementSize() {
        var aUrl = url.parse(this.req.url).pathname.split("/");
        return aUrl.length;
    }
    stringEndsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }
    hasHeader(header) {
        return this.getHeader(header);
    }
    getHeader(header) {
        return this.req.headers[header.toLowerCase()];
    }
    getCalIdFromURL() {
        return this.cal;
    }
    getCardIdFromURL() {
        return this.card;
    }
    getUserIdFromURL() {
        return this.username;
    }
}

module.exports = comm;
