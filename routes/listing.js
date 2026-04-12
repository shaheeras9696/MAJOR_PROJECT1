const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});


    //search 
    router.get("/search", async (req, res) => {
  let { query } = req.query;

  if (!query) return res.json([]);

  const listings = await Listing.find({
    title: { $regex: query, $options: "i" }
  }).limit(5); // limit suggestions

  res.json(listings);
}); 

//Idex and Create route combined by same path "/"
router.route("/")
.get(wrapAsync(listingController.index)) // Index Route
.post(isLoggedIn,upload.single("listing[image]"),validateListing, wrapAsync(listingController.createListing)); // Create Route



//New Route
router.get("/new",isLoggedIn,listingController.renderNewForm);

//Show Route, Update route and delete route combined by same path "/:id"
router.route("/:id")
.get( wrapAsync(listingController.showListing))
.put(isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));


//Edit Route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm));


module.exports = router;