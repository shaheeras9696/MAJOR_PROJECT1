const Listing = require("../models/listing");
const Review = require("../models/review");

//Route --- Create Reviews
module.exports.createReview = async(req, res)=>{
 let listing = await Listing.findById(req.params.id);
 let newReview = new Review(req.body.review);
 newReview.author = req.user._id; // connecting author with the review 
 //console.log(newReview);
 listing.reviews.push(newReview);

 await newReview.save();
 await listing.save();
 req.flash("success","New Review Created!");
 res.redirect(`/listings/${listing._id}`);
};


// Routes --- Delete Reviews
module.exports.destroyReview = async (req,res)=>{
    let{id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews : reviewId}});// $pull - Mongoose special operator to remove an existing array
    await Review.findByIdAndDelete(reviewId);
     req.flash("success"," Review Deleted!");
    res.redirect(`/listings/${id}`);
};