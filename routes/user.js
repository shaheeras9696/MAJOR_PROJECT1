const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

const userController = require("../controllers/users.js");

router.route("/signup")
.get(userController.renderSignupForm )
.post( wrapAsync(userController.signup));


//Login
router.route("/login")
.get(userController.renderLoginForm )
.post(saveRedirectUrl,
     passport.authenticate("local", {
        failureRedirect:'/login', 
        failureFlash: true,
    }), // if this conditions works then it will go to the next login process

    userController.login

);

//log Out
router.get("/logout",userController.logout);

module.exports = router;