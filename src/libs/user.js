class user {
    constructor(username) {
        this.username = username;
        return this;
    }
    getUserName() {
        return this.username;
    }
}

module.exports = {
    user: user,
};


