const ErrorResponse = require('../utils/errorResponse');
const Review = require('../models/Review');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');
const User = require('../models/User');
const mysql = require('../server');

// @desc   Get reviews
// @route  GET /ap1/v1/reviews
// @route  GET /ap1/v1/bootcamps/:bootcampId/reviews
// @acces  Public
exports.getReviews = asyncHandler(async (req, res, next) => {

    if (req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId }).populate({
            path: 'user',
            select: 'name'
        });
        const bootcamp = await Bootcamp.findById(req.params.bootcampId);


        res.status(200).render('reviews', {currentUser: req.currentUser, reviews: reviews, bootcamp: bootcamp, message: req.flash("error")});
        // return res.status(200).json({
        //     succes: true,
        //     count: reviews.length,
        //     data: reviews
        // })
    } else {
        res.status(200).json(res.advancedResults);
    }
});

// @desc   Get single review
// @route  GET /ap1/v1/reviews/:id
// @acces  Public
exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description id'
    });

    if(!review) {
        return next(new ErrorResponse(`No review found with the id of ${req.params.id}`, 404    ));
    }

    res.status(200).render('edit-review', {review: review, currentUser: req.currentUser, message: req.flash("error")});
    // res.status(200).json({
    //     success: true,
    //     data: review
    // });
});

// @desc   Add review
// @route  POST /ap1/v1/bootcamps/:bootcampId/reviews
// @acces  Private
exports.addReview = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    const { title, text, rating, user } = req.body;

    const review = await Review.findOne({bootcamp: req.params.bootcampId})
    if(review){
        req.flash('error',`You already add revirew to ${bootcamp.name}`);
        res.redirect('/');
    }else{

    if(!bootcamp) {
        req.flash('error',`No bootcamp with the id of ${req.params.bootcampId}`);
        res.redirect('/');
    }

    const sql = `SELECT
    reviews.title as title,
    reviews.text as text,
    ratings.rating as rating,
    users.id as user,
    bootcamps.id as bootcamp, 
    FROM courses
    INNER JOIN bootcamps
    ON bootcamps.id = courses.bootcamp_id
    INNER JOIN users
    ON users.id = courses.user_id
    INNER JOIN ratings
    ON ratings.id = courses.ratings_id;`;

        mysql.query(sql, asyncHandler(async (err, results, fileds) => {

    const review = await Review.create( {
        title: title,
        text: text,
        user: user,
        rating: rating,
        bootcamp: bootcamp.id,
    });

    res.status(200).redirect("/api/v1/bootcamps/" + bootcamp.id + "/courses")
        

    }));
    // res.status(201).json({
    //     success: true,
    //     data: review
    // });
 }
});

// @desc   Update review
// @route  PUT /ap1/v1/reviews/:id
// @acces  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);

    const { title, text, rating } = req.body;

    if(!review) {
        req.flash('error',`No review with the id of ${req.params.id}`);
        res.redirect('/');
    }

    // Makse sure review belongs to user or suer is admin
    if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        req.flash('error',`Not authorized to update review`); 
        res.redirect('/');      
    }


    const sql = `SELECT
    reviews.title as title,
    reviews.text as text,
    ratings.rating as rating,
    users.id as user,
    bootcamps.id as bootcamp, 
    FROM courses
    INNER JOIN bootcamps
    ON bootcamps.id = courses.bootcamp_id
    INNER JOIN users
    ON users.id = courses.user_id
    INNER JOIN ratings
    ON ratings.id = courses.ratings_id;`;

        mysql.query(sql, asyncHandler(async (err, results, fileds) => {


    review = await Review.findByIdAndUpdate(req.params.id, 
        {
            title: title,
            text: text,
            rating: rating,
        }
        , {
        new: true,
        runValidators: true
    });


    res.status(200).redirect("/api/v1/reviews/" + req.currentUser.id +"/manage");
    // res.status(201).json({
    //     success: true,
    //     data: review
    // });
    }));

});

// @desc   Delete review
// @route  DELETE /ap1/v1/reviews/:id
// @acces  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if(!review) {
        return next(new ErrorResponse(`No review with the id of ${req.params.id}`, 404));
    }

    // Makse sure review belongs to user or suer is admin
    if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`Not authorized to update review`, 401));       
    }

    await review.remove();


    res.status(200).redirect("/api/v1/reviews/" + req.currentUser.id +"/manage");
    // res.status(201).json({
    //     success: true,
    //     data: {}
    // });
});

// Render Add Course page
// /api/v1/reviews/add/:bootcampId/review
//get
exports.addReviewPage = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    res.render('add-review', {currentUser: req.currentUser, bootcamp: bootcamp, message: req.flash("error")});
});


// @desc   Get for user all reviews
// @route  GET /api/v1/reviews/:id/manage
// @acces  Private
exports.manageReviews = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.params.id);
    const reviews = await Review.find({user: user}).populate({
        path: 'bootcamp',
        select: 'name'
    });

    if (!reviews) {
        return next(new ErrorResponse(`No reviews with id of ${req.params.id}`), 404);User
    }

    res.status(200).render('manage-reviews', {reviews: reviews, currentUser: user, message: req.flash("error")});
    // res.status(200).json({
    //     succes: true,
    //     data: reviews
    // });
});