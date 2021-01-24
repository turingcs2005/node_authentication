const router = require('express').Router();
const verify = require('./verifyToken');
const User = require('../model/User');

router.get('/', verify, async (req, res) => {
    res.json(
        {
            posts: {title: 'my posts', description: 'some data'},
            user: req.user
        }
    );
    const u = await User.findOne({_id: req.user._id});
    console.log(u.name);
});

module.exports = router;