const router = require('express').Router();
const User = require('../model/User');
const { registerValidation, loginValidation } = require('../validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// register
router.post('/register', async (req, res) => {
    const {error} = registerValidation(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    } else {
        // check by email if user already present in database
        const u = await User.findOne({ email: req.body.email });
        if (u) {
            return res.status(400).send('A user already exists by that email.');
        } else {
            // hash password
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(req.body.password, salt);

            // if no error, create a new user
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hashPassword // use hash instead of original password
            });

            // save user to database
            try {
                const savedUser = await user.save();
                res.send('User has been successfully created.');
            } catch (err) {
                res.status(400).send(err);
            };
        }
    }

});

// login
router.post('/login', async (req, res) => {
    const {error} = loginValidation(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    } else {
        // check if user does not exist by that email
        const u = await User.findOne({ email: req.body.email });
        if (!u) {
            return res.status(400).send('A user does not exist by that email.');
        } else {
            // check password
            const validPass = await bcrypt.compare(req.body.password, u.password)
            if (!validPass) {
                return res.status(400).send('Invalid password.');
            } else {
                // create and assign a token
                const token = jwt.sign({_id: u._id}, process.env.TOKEN_SECRET);
                res.status(200).header('auth-token', token).send(token);
            }
        }
    }

});

module.exports = router;