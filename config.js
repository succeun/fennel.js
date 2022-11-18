var config =
{
    version_nr: '0.1.0',

    // Server specific configuration
    // Please use a proxy in front of Fennel to support TLS.
    // We suggest you use nginx as the TLS endpoint
    port: 8000,
    //port: 80,
    ip: '127.0.0.1',
    //ip: '0.0.0.0',

    // db specific configuration. you can use whatever sequelize supports.
    db_name: 'fennel',
    db_uid: 'uid',
    db_pwd: 'pwd',
    db_dialect: 'sqlite',
    db_logging: true,
    db_storage: 'fennel.sqlite',
    // db_host: 'localhost', // For myql, postgres etc.

    // Authentication
    // Authentication methods so far: courier, htaccess, ldap, test
    auth_method: 'test',
    auth_method_courier_socket: '/var/run/courier/authdaemon/socket',
    auth_method_htaccess_file: 'demouser.htaccess',

    // ldap authentication requires the ldapjs@1.0.0 node module. Please install manually
    auth_method_ldap_url: 'ldap://localhost:3002',
    auth_method_ldap_user_base_dn: 'ou=users,dc=example',


    // Authorisation
    // Authorisation Rules:
    // This property takes an array of Shiro formatted strings. Users are
    // only permitted access to resources when said access is explicitly
    // allowed here. Please see http://shiro.apache.org/permissions.html
    // for a short introduction to Shiro Syntax.
    //
    // Fennel uses the URL + the function to check for authorisation.
    // /card/demo/default/card_id.vcf with method PUT will become
    // card:demo:default:card_id.vcf:put
    //
    // Please note that $username is not recognised by shiro-trie but
    // will be replaced by Fennel with the current user when loaded into
    // the current process.
    //
    // The current set will allow the owner to access his or her own stuff
    authorisation: [
        'cal:$username:*',
        'card:$username:*',
        'p:options,report,propfind',
        'p:$username:*'
    ],

    test_user_name: 'demo',
    test_user_pwd: 'demo'
};

module.exports = {
    config: config
};
