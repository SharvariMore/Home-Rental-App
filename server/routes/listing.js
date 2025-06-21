const router = require("express").Router();
const multer = require("multer");

const Listing = require("../models/Listing");
const User = require("../models/User");

/*Configuration multer for uploading file*/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

router.post("/create", upload.array("listingPhotos"), async (req, res) => {
  try {
    const {
      creator,
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    } = req.body;

    // const user = await User.findById(userId);

    const listingPhotos = req.files;

    if (!listingPhotos) {
      return res.status(400).send("No File Uploaded!");
    }

    //Store photo path in mongodb
    const listingPhotoPaths = listingPhotos.map((file) => file.path);

    const newListing = new Listing({
      creator,
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      listingPhotoPaths,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    });

    await newListing.save();

    res.status(200).json(newListing);
  } catch (error) {
    res
      .status(409)
      .json({ message: "Failed to Create Listing!", error: error.message });
    console.log(error);
  }
});

//Fetch listing by category
router.get("/", async (req, res) => {
  const qCategory = req.query.category;
  try {
    let listings;
    if (qCategory) {
      listings = await Listing.find({ category: qCategory }).populate(
        "creator"
      );
    } else {
      listings = await Listing.find().populate("creator");
    }

    res.status(200).json(listings);
  } catch (error) {
    res
      .status(404)
      .json({ message: "Failed to Fetch Listings!", error: error.message });
    console.log(error);
  }
});

//Fetch listing by search
router.get("/search/:search", async (req, res) => {
  let { search } = req.params;
  try {
    let listings = []; //return empty array if cannot find any listing

    if (search === "all") {
      listings = await Listing.find().populate("creator");
    } else {
      listings = await Listing.find({
        //find any category or title that match with params and options with i is to search for case insensitive
        $or: [
          { category: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
        ],
      }).populate("creator");
    }

    res.status(200).json(listings);
  } catch (error) {
    res
      .status(404)
      .json({ message: "Failed to Find Listings!", error: error.message });
    console.log(error);
  }
});

router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const listing = await Listing.findById(listingId).populate("creator");
    res.status(202).json(listing);
  } catch (error) {
    res
      .status(404)
      .json({ message: "Listing Not Found!", error: error.message });
    console.log(error);
  }
});

module.exports = router;
