var log = require('./log').log;
var config = require('../../config').config;

var Sequelize = require('sequelize');

/**
 *
 * @type {*|Promise.Sequelize|Sequelize}
 */
var sequelize = new Sequelize(config.db_name, config.db_uid, config.db_pwd, {
    host: config.db_host || 'localhost',
    dialect: config.db_dialect,
    logging: function( info ) {if(config.db_logging){log.info(info)}}, // thanks to mdarveau for the fix
    storage: config.db_storage
});

/**
 *
 * @type {Model}
 * represents an event object with a start and an end date
 */
var ICS = sequelize.define('ICS', {
    pkey: { type: Sequelize.STRING, allowNull: false, unique: true, primaryKey: true},
    calendarId: { type: Sequelize.STRING, allowNull: false},
    startDate: { type: Sequelize.DATE, allowNull: false},
    endDate: { type: Sequelize.DATE, allowNull: false},
    content: { type: Sequelize.TEXT, allowNull: false}
});

/**
 *
 * @type {Model}
 * represents a calendar object containing events (ics)
 */
var CAL = sequelize.define('CAL', {
    pkey: { type: Sequelize.STRING, allowNull: false, unique: true, primaryKey: true},
    owner: { type: Sequelize.STRING, allowNull: false},
    timezone: { type: Sequelize.TEXT, allowNull: false},
    order: { type: Sequelize.STRING, allowNull: false},
    free_busy_set: { type: Sequelize.STRING, allowNull: false},
    supported_cal_component: { type: Sequelize.STRING, allowNull: false},
    colour: { type: Sequelize.STRING, allowNull: false},
    displayname: { type: Sequelize.STRING, allowNull: false},
    synctoken: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0}
});

/**
 *
 * @type {Model}
 * represents an address (vcard) object
 */
var VCARD = sequelize.define('VCARD', {
    pkey: { type: Sequelize.STRING, allowNull: false, unique: true, primaryKey: true},
    ownerId: { type: Sequelize.STRING, allowNull: false},
    addressbookId: { type: Sequelize.STRING, allowNull: false},
    content: { type: Sequelize.TEXT, allowNull: false},
    is_group: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false}
});

/**
 *
 * @type {Model}
 * represents an addressbook containing addresses (vcard)
 */
var ADDRESSBOOK = sequelize.define('ADB', {
    pkey: { type: Sequelize.STRING, allowNull: false, unique: true, primaryKey: true},
    ownerId: { type: Sequelize.STRING, allowNull: false},
    name: { type: Sequelize.STRING, allowNull: false},
    synctoken: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0}
});

/**
 *
 * @type {Model}
 * users are grouped into usergroup. this is the binding table between users -n--n- groups
 */
var USER_GROUP = sequelize.define('USER_GROUP', {
    userId: { type: Sequelize.STRING, allowNull: false, unique: false, primaryKey: true},
    groupId: { type: Sequelize.STRING, allowNull: false, unique: false, primaryKey: true},
    description: { type: Sequelize.TEXT, allowNull: true}
});

/**
 *
 * @type {Model}
 * a group of users which can have specific authorisation rules and permissions.
 * a group is somewhat a role in RBAC.
 */
var GROUP = sequelize.define('GROUP', {
    groupId: { type: Sequelize.STRING, allowNull: false, unique: false, primaryKey: true},
    description: { type: Sequelize.TEXT, allowNull: true}
});

/**
 *
 * @type {Model}
 * a permission for a specific group. Permission has always this structure:
 *
 * entrypoint(card vs calendar):path:to:element:action
 *
 * Users need to have respective permission to execute specific action
 */
var PERMISSION = sequelize.define('PERMISSION', {
    permissionId: { type: Sequelize.STRING, allowNull: false, unique: true, primaryKey: true},
    groupId: { type: Sequelize.STRING, allowNull: false},
    permission: { type: Sequelize.TEXT, allowNull: false}
});

sequelize.sync().then(() => {
        log.info("Database structure updated");
    }).catch(function(error) {
        log.error("Database structure update crashed: " + error);
    }
);

// Exporting.
module.exports = {
    ICS: ICS,
    CAL: CAL,
    VCARD: VCARD,
    ADB: ADDRESSBOOK,
    sequelize: sequelize
};