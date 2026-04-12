const Listing = require("../models/listing"); // required module from the Routes-listings
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken:mapToken});

//Route --- Index Route
//Route --- Index Route
module.exports.index = async (req, res) => {
  let { category, search, exact } = req.query;

  let query = {};

  // ✅ CATEGORY FILTER
  if (category) {
    query.category = category;
  }

  // ✅ EXACT MATCH (highest priority)
  if (exact) {
    query.title = exact;
  }

  // ✅ SEARCH (only if exact not present)
  else if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  const allListings = await Listing.find(query);

  res.render("listings/index", { allListings });
};


// module.exports.index = async (req,res)=>{
//     const allListings = await Listing.find({});
//     res.render("listings/index",{allListings});
// };

//Routes --- New Route
module.exports.renderNewForm = (req, res) =>{
    res.render("listings/new.ejs");
};

//Routes --- ShowRoute
module.exports.showListing = async(req,res,next)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate:{
            path:"author", // populating or connecting author to the review
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
       return res.redirect("/listings");
    }
   // console.log(listing);
    res.render("listings/show.ejs",{listing});
};

// Route --- Create Route
module.exports.createListing = async(req,res,next)=>{
// to get the corrdinations of Map frpm geometry
  let response = await geocodingClient
  .forwardGeocode({
  query:req.body.listing.location,
  limit: 1,
})
  .send();


     let url = req.file.path; //getting the path of the file
     let filename = req.file.filename;
    //  console.log(url,"..", filename);
     const newListing = new Listing(req.body.listing);
     newListing.owner = req.user._id;// it represents the owner id
     newListing.image = {url, filename};// to print and store url and filename in mongodb
     // to get the coordinators to be saved in backend
    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);
     req.flash("success","New Listing Created!");
     res.redirect("/listings");

};

//Route --- Edit Route
module.exports.renderEditForm = async(req,res)=>{
 let {id} = req.params;
 const listing = await Listing.findById(id);
 if(!listing){
        req.flash("error","Listing you requested for does not exist!");
       return res.redirect("/listings");
    }

    //To make a replace of preview edit Images
let originalImageUrl = listing.image.url;
originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
 res.render("listings/edit.ejs",{listing, originalImageUrl});
};

//Route --- Update Route
module.exports.updateListing = async(req,res)=>{
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send valid data for listing");
    // }
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
 
    // To upadte the image we have to write this logic

    if(typeof req.file !== "undefined"){ // it checks whether the image i empty /undefined if not it needs updation then this logic works....
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }

    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

//Route --- Delete Route
module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};


