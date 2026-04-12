const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
    email:{
        type: String,
        required: true,
    }
});

userSchema.plugin(passportLocalMongoose);// plugin automatically implement salt and hasing 
// it also creates the methods such as setPassword, changePassword, authenticate Password etc
module.exports = mongoose.model('User', userSchema);