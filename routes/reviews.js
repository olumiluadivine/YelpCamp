const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressErrors');
const Review = require('../models/review');
const Campground = require('../models/campground');
const { reviewSchema } = require('../schemas.js')

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const errorMessage = error.details.map(el => el.message).join(',')
        throw new ExpressError(errorMessage, 400);
    } else {
        next();
    }
}

router.post('/', validateReview, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await campground.save()
    await review.save()
    req.flash('success', 'Review Added');
    res.redirect(`/campgrounds/${campground.id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Deleted Review');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;