const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressErrors');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas.js')

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const errorMessage = error.details.map(el => el.message).join(',')
        throw new ExpressError(errorMessage, 400);
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Data', 400);
    const campgrounds = new Campground(req.body.campground);
    await campgrounds.save();
    req.flash('success', 'Created new Campground');
    res.redirect(`/campgrounds/${campgrounds.id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
    const campgrounds = await Campground.findById(req.params.id).populate('reviews');
    if (!campgrounds) {
        req.flash('error', 'Could not find page!!');
        return res.redirect('/campgrounds')
    }
    console.log(campgrounds)
    res.render('campgrounds/show', { campgrounds });
}))

router.get('/:id/edit', catchAsync(async (req, res) => {
    const campgrounds = await Campground.findById(req.params.id);
    if (!campgrounds) {
        req.flash('error', 'Could not find page!!');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campgrounds });
}))

router.patch('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campgrounds = await Campground.findByIdAndUpdate(id, req.body.campground);
    req.flash('success', 'Updated Campground');
    res.redirect(`${campgrounds.id}`);
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Deleted Campground');
    res.redirect('/campgrounds');
}))

module.exports = router;