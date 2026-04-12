const User = require("../models/user");

module.exports.renderSignupForm = (req, res)=>{
    res.render("users/signup.ejs");
};

//SignUp
module.exports.signup = async(req,res)=>{
   try{
    let{username, email,password} = req.body;
    const newUser = new User({email,username});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{ // Atomatically Loggin when the User Sign Ups....
        if(err){
            return next(err);   // if error occured it throws the error orelse 
        }
         req.flash("success","Welcome to Wanderlust!"); // Gets logged in
         res.redirect("/listings");
    });
   
   } catch(e){
    req.flash("error", e.message);
    res.redirect("/signup");
   }
};

//Rendering Login Form
module.exports.renderLoginForm =(req, res)=>{
    res.render("users/login.ejs");
};

//SuccessFul login
module.exports.login =  async(req,res) => {
req.flash("success","Welcome back to Wanderlust!");
 let redirectUrl = (res.locals.redirectUrl || "/listings");
res.redirect(redirectUrl);
};

//Logout
module.exports.logout = (req,res,next)=>{
req.logout((err)=>{
    if(err){
      return next(err);
    }
    req.flash("success","You are Logged Out");
    res.redirect("/listings");
});
};

