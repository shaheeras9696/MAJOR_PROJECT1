const express = require("express");
const router = express.Router({mergeParams:true});// merge params- to get utilized from parent routes
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview,isLoggedIn, isReviewAuthor} = require("../middleware.js");
const { createReview } = require("../controllers/reviews.js");

const reviewController = require("../controllers/reviews.js");



//POST Create Review Route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

//Delete Review Route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports = router;