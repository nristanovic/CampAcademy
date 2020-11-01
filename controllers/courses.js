const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');

const mysql = require('../server');

// @desc   Get courses
// @route  GET /ap1/v1/courses
// @route  GET /ap1/v1/bootcamps/:bootcampId/courses
// @acces  Public
exports.getCourses = asyncHandler(async (req, res, next) => {

    if (req.params.bootcampId) {
        const bootcamp = await Bootcamp.findById(req.params.bootcampId);
        const courses = await Course.find({ bootcamp: req.params.bootcampId });

        return res.status(200).render('bootcamp', {bootcamp: bootcamp, courses: courses, currentUser: req.currentUser, message: req.flash("error")})

        // return res.status(200).json({
        //     succes: true,
        //     count: courses.length,
        //     data: courses
        // })
    } else {
        res.status(200).json(res.advancedResults);
    }
});

// @desc   Get single course
// @route  GET /ap1/v1/courses/:id
// @acces  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) {
        return next(new ErrorResponse(`No course with id of ${req.params.id}`), 404);
    }

    res.status(200).json({
        succes: true,
        data: course
    });
});



// @desc   Add Course
// @route  POST /ap1/v1/bootcamps/:bootcampId/courses
// @acces  Private
exports.addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    const { title, weeks, tuition, minimumSkill, description, scholarshipAvailable,  user } = req.body;

    if (!bootcamp) {
        req.flash('error',`No bootcamp with id of ${req.params.bootcampId}`);
        res.redirect('/');
    }

    // Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        req.flash('error',`User ${req.user.id} is not authorized to add a course to ${bootcamp._id} bootcamp`);
        res.redirect('/');
    }


    const sql = `SELECT
    courses.title as title,
    courses.weeks as weeks,
    courses.description as description,
    courses.scholarshipAvailable as scholarshipAvailable
    costs.tuition as tuition,
    skills.minimumSkill as minimumSkill
    users.id as user
    bootcamps.id as bootcamp 
    FROM courses
    INNER JOIN bootcamps
    ON bootcamps.id = courses.bootcamp_id
    INNER JOIN users
    ON users.id = courses.user_id
    INNER JOIN skills
    ON skills.id = courses.skill_id
    INNER JOIN costs
    ON costs.id = courses.cost_id;`;

    mysql.query(sql, asyncHandler(async (err, results, fileds) => {
    const course = await Course.create({
        title: title,
        weeks: weeks,
        tuition: tuition,
        minimumSkill: minimumSkill,
        description: description,
        scholarshipAvailable: scholarshipAvailable,
        bootcamp: bootcamp.id,
        user: user
    });

    res.status(200).redirect("/api/v1/bootcamps/" + bootcamp.id + "/courses")
    }));
    // res.status(200).json({
    //     succes: true,
    //     data: course
    // });
});

// @desc   Update Course
// @route  PUT /ap1/v1/courses/:id
// @acces  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);
    const bootcamp = await Bootcamp.findOne({user: req.currentUser});

    const { title, weeks, tuition, minimumSkill, description, scholarshipAvailable } = req.body;

    if (!course) {
        req.flash('error',`No course with id of ${req.params.bootcampId}`);
        res.redirect('/');
    }

    // Make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        req.flash('error',`User ${req.user.id} is not authorized to update a course ${course._id}`);
        res.redirect('/');
    }

    const sql = `SELECT
    courses.title as title,
    courses.weeks as weeks,
    courses.description as description,
    courses.scholarshipAvailable as scholarshipAvailable
    costs.tuition as tuition,
    skills.minimumSkill as minimumSkill
    users.id as user
    bootcamps.id as bootcamp 
    FROM courses
    INNER JOIN bootcamps
    ON bootcamps.id = courses.bootcamp_id
    INNER JOIN users
    ON users.id = courses.user_id
    INNER JOIN skills
    ON skills.id = courses.skill_id
    INNER JOIN costs
    ON costs.id = courses.cost_id;`;

    mysql.query(sql, asyncHandler(async (err, results, fileds) => {

    course = await Course.findByIdAndUpdate(req.params.id, 
        {
            title: title,
            weeks: weeks,
            tuition: tuition,
            minimumSkill: minimumSkill,
            description: description,
            scholarshipAvailable: scholarshipAvailable,
        }
        , {
        new: true,
        runValidators: true
    });

    res.status(200).redirect("/api/v1/bootcamps/" + bootcamp.id + "/courses");
    }));
    // res.status(200).json({
    //     succes: true,
    //     data: course
    // });
});

// @desc   Delete Course
// @route  DELETE /ap1/v1/courses/:id
// @acces  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);
    const bootcamp = await Bootcamp.findOne({user: req.user});

    if (!course) {
        return next(new ErrorResponse(`No course with id of ${req.params.bootcampId}`), 404);
    }

    // Make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete a course ${course._id}`, 401));
    }

    await course.remove();

    res.status(200).redirect("/api/v1/bootcamps/" + bootcamp.id + "/courses"); 

    // res.status(200).json({
    //     succes: true,
    //     data: {}
    // });
});

// Render Add Course page
// /api/v1/courses/add/:bootcampId/course
//get
exports.addCoursePage = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    res.render('add-course', {currentUser: req.currentUser, bootcamp: bootcamp, message: req.flash("error")});
});

//Get Bootcamp for edit
// GET /ap1/v1/courses/:id/edit
exports.getCourseForEdit = asyncHandler(async (req, res, next) => {

    
    
    const course = await Course.findById(req.params.id);
    const bootcamp = await Bootcamp.findOne({user: req.currentUser});

    if (!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    res.status(200).render('edit-course', {bootcamp: bootcamp, currentUser: req.currentUser, course: course, message: req.flash("error")});

});

