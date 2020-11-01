const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const { json } = require('express');
const advancedResults = require('../middleware/advancedResults');
const BootcampSQL = require('../modelsSQL/Address');
const mysql = require('../server');


// @desc   Get all bootcamps
// @route  GET /ap1/v1/bootcamps
// @acces  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    
     
    res.status(200).render('index',  res.advancedResults );


});

// @desc   Get single bootcamps
// @route  GET /ap1/v1/bootcamps/:id
// @acces  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    

    const bootcamp = await Bootcamp.findOne({user: req.currentUser.id});



    if (!bootcamp) {
        return res.status(200).render('manage-bootcamp-none', {currentUser: req.currentUser, message: req.flash("error")});
        next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    res.status(200).render('manage-bootcamp', {bootcamp: bootcamp, currentUser: req.currentUser, message: req.flash("error")});
    // json({ succes: true, data: bootcamp });

});

//Get Bootcamp for edit
// GET /ap1/v1/bootcmaps/:id/edit
exports.getBootcampForEdit = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    res.status(200).render('edit-bootcamp', {bootcamp: bootcamp, currentUser: req.currentUser, message: req.flash("error")});

});

// @desc   Create new bootcamp
// @route  POST /ap1/v1/bootcamps
// @acces  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    // Add user to req,body
    req.body.user = req.user.id;

    const { name, address, phone, email, website, description, careers } = req.body;

    //Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    // If the user is not an admin, they can only add one bootcamp
    if(publishedBootcamp && req.user.role !== 'admin') {
        req.flash('error', `The user with ID ${req.user.id} has already published a bootcamp`);
        res.redirect('/');
    }

    const sql = `SELECT
       bootcamps.name  as name,
       bootcamps.description as description,
       bootcamps.website as website,
       bootcamps.phone as phone,
       bootcamps.email as email,
       bootcamps.address as address,
       careers.name as careers,
       users.id as user,
        FROM
        bootcamps
        INNER JOIN careers on careers.id = bootcamps.career_id
        INNER JOIN users on careers.id = bootcamps.user_id`;


    mysql.query(sql, asyncHandler(async (err, results, fileds) => {

        const bootcamp = await Bootcamp.create({
            name: name,
            email: email,
            address: address,
            phone: phone,
            website: website,
            description: description,
            careers: careers,
            user: req.user.id

        });
        
        res.status(200).redirect("/api/v1/bootcamps/"+req.currentUser.id);
    }));
    // res.redirect('/');

    
    // res.status(201).json({
    //     succes: true,
    //     data: bootcamp
    // });


});

// @desc   Update bootcamp
// @route  PUT /ap1/v1/bootcamps/:id
// @acces  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {

    let bootcamp = await Bootcamp.findById(req.params.id);

    const { name, address, phone, email, website, description, careers } = req.body;

    if (!bootcamp) {
        req.flash('error', `Bootcamp not found with id of ${req.params.id}`);
        res.redirect('/');
    }

    // Make sure user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        req.flash('error',`User ${req.user.id} is not authorized to update this bootcamp`);
        res.redirect('/');
    }

    const sql = `SELECT
       bootcamps.name  as name,
       bootcamps.description as description,
       bootcamps.website as website,
       bootcamps.phone as phone,
       bootcamps.email as email,
       bootcamps.address as address,
       careers.name as careers,
       users.id as user,
        FROM
        bootcamps
        INNER JOIN careers on careers.id = bootcamps.career_id
        INNER JOIN users on careers.id = bootcamps.user_id`;

    mysql.query(sql, asyncHandler(async (err, results, fileds) => {

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id,
        {
            name: name,
            email: email,
            address: address,
            phone: phone,
            website: website,
            description: description,
            careers: careers,
        }
        , {
        new: true,
        runValidators: true
    });

    res.status(200).redirect("/api/v1/bootcamps/"+req.currentUser.id);

    }));

    
    // res.status(200).json({ succes: true, data: bootcamp });


});

// @desc   Delete bootcamp
// @route  DELETE /ap1/v1/bootcamps/:id
// @acces  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`, 401));
    }

    
    bootcamp.remove();

    res.status(200).redirect("/api/v1/bootcamps/"+req.currentUser.id);
    // res.status(200).json({ succes: true, data: {} });

});


// @desc   Get bootcamps within a radius
// @route  GET /ap1/v1/bootcamps/radius/:zipcode/:distance
// @acces  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.body.dis;

    if( zipcode.length < 1 || distance.length < 1) {
        req.flash('error','You must set zipcode and distance.');
        res.redirect('/');
    }

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians
    // Divide distance by radius of Earth
    // Earth radius = 3.963 mi / 6.378 km
    const radius = distance / 6378;

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere : [ [ lng, lat], radius ]}}
    });

    
    
    res.status(200).render('index', {results: bootcamps, startIndex: null, currentUser: req.currentUser, message: req.flash("error")});

    // res.status(200).json({
    //     succes: true,
    //     count: bootcamps.length,
    //     data: bootcamps
    // });
});

// Render Add Bootcamp page
// /api/v1/bootcamps/add/bootcam
//get
exports.addBootcampPage = asyncHandler(async (req, res, next) => {
    res.render('add-bootcamp', {currentUser: req.currentUser, message: req.flash("error")});
});


// @desc   Upload photo for boocamp
// @route  PUT /ap1/v1/bootcamps/:id/photo
// @acces  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        req.flash('error',`Bootcamp not found with id of ${req.params.id}`);
        res.redirect("/api/v1/bootcamps/"+req.currentUser.id);
    }

    // Make sure user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        req.flash('error',`User ${req.params.id} is not authorized to add photo to this bootcamp`);
        res.redirect("/api/v1/bootcamps/"+req.currentUser.id);
    }

    if(!req.files) {
        req.flash('error',`Please upload a file`, 400);
        res.redirect("/api/v1/bootcamps/"+req.currentUser.id);
    }

    const file = req.files.file;

    //Make sure the image is a photo
    if(!file.mimetype.startsWith('image')){
        req.flash('error',`Please upload a image file`);
        res.redirect("/api/v1/bootcamps/"+req.currentUser.id);
    }

    //Check filesize
    if(file.size > process.env.MAX_FILE_UPLOAD){
        req.flash('error',`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`);
        res.redirect("/api/v1/bootcamps/"+req.currentUser.id);
    }


    // Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err){
            console.log(err);
            req.flash('error',`Problem with file upload`);
            res.redirect("/api/v1/bootcamps/"+req.currentUser.id);
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo : file.name });


        
            res.status(200).redirect("/api/v1/bootcamps/"+req.currentUser.id);
        
        // res.status(200).json({
        //     succes: true,
        //     data: file.name
        // });
    });
});