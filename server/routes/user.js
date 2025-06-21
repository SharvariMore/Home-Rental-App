const router = require("express").Router();

const Booking = require("../models/Booking");
const User = require("../models/User");
const Listing = require("../models/Listing");

//Fetch Trip List
router.get("/:userId/trips", async (req, res) => {
  try {
    const { userId } = req.params;
    const trips = await Booking.find({ customerId: userId }).populate(
      "customerId hostId listingId"
    );
    res.status(202).json(trips);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Trips Not Found!", error: error.message });
  }
});

//Update wish list
router.patch("/:userId/:listingId", async (req, res) => {
  try {
    const { userId, listingId } = req.params;
    const user = await User.findById(userId);
    const listing = await Listing.findById(listingId).populate("creator");

    //find each item in wish list and compare it with each listingId in params
    const favListing = user.wishList.find(
      (item) => item._id.toString() === listingId
    );

    if (favListing) {
      //by clicking on heart icon remove item from wishlist(present already in list)
      user.wishList = user.wishList.filter(
        (item) => item._id.toString() !== listingId
      );
      await user.save();
      res.status(200).json({
        message: "Listing is Removed From Wish List!",
        wishList: user.wishList,
      });
    } else {
      //by clicking on heart icon add item to wishlist(not present already in list)
      user.wishList.push(listing);
      await user.save();
      res.status(200).json({
        message: "Listing is Added To Wish List!",
        wishList: user.wishList,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: error.message });
  }
});

//Fetch Property List
router.get("/:userId/properties", async (req, res) => {
  try {
    const { userId } = req.params;
    const properties = await Listing.find({ creator: userId }).populate(
      "creator"
    );
    res.status(202).json(properties);
  } catch (error) {
    console.log(error);
    res
      .status(404)
      .json({ message: "Properties Not Found!", error: error.message });
  }
});

//Fetch Reservation List
router.get("/:userId/reservations", async (req, res) => {
  try {
    const { userId } = req.params;
    const reservations = await Booking.find({ hostId: userId }).populate(
      "customerId hostId listingId"
    );
    res.status(202).json(reservations);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Reservations Not Found!", error: error.message });
  }
});

module.exports = router;
