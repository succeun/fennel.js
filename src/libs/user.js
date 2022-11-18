// Exporting.
module.exports = {
    user: user,
};

function user(username) {
    this.username = username;

    return this;
}

user.prototype.getUserName = function () {
    return this.username;
};
