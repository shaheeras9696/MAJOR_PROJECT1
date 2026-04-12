if(process.env.NODE_ENV !="production"){ // for development can use env but for Production we should not use 
require('dotenv').config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");  //to get connected mongo storage , we use when we deploy into mongodb atlas....
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");



const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"; // For local storage URL 

const dbUrl = process.env.ATLASDB_URL; // to store in MongoAtlas DB

main().then(()=>{
    console.log("Connected to DB");
}).catch(err => {
    console.log(err);
});
async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


//mongo store code
const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err)=>{
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now()+ 7 * 24 * 60 * 60 * 1000,//day hours minutes seconds milliseconds
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));
app.use(flash());//flash to be written before route

app.use(passport.initialize());// initializing the passport 
app.use(passport.session()); //passport session , 1 userr ---> 1 session
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); //to store
passport.deserializeUser(User.deserializeUser());// to remove

app.use((req,res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


// routes for listings
app.use("/listings", listingsRouter);
// for reviews router
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);


//if it doesnt match anything this error is throwed commonly

app.use((req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});

app.use((err,req,res,next)=>{
    let {statusCode = 500, message="Something Went Wrong!"} = err;
    res.status(statusCode).render("error.ejs",{message});
  //  res.status(statusCode).send(message);
});

app.listen(8080, ()=>{
    console.log("server is listening to port 8080");
});