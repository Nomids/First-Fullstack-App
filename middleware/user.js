const User = require('../modules/user');

module.exports = async function(req, res, next) {
    if(!req.session.user) {
        console.log(req.user);
        return next();
    }

    req.user = await User.findById(req.session.user._id);
    next();
}