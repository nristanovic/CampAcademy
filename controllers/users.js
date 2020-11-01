const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

const mysql = require('../server');

// @desc   Get all users    
// @route  GET /ap1/v1/auth/users
// @acces  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults); 
});

// @desc   Get single users    
// @route  GET /ap1/v1/auth/users/:id
// @acces  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    

    res.status(200).render('manage-account', {user: user, currentUser: user, message: req.flash("error")});
    // res.status(200).json({
    //     success: true,
    //     data: user
    // });
});

// @desc   Create users    
// @route  POST /ap1/v1/auth/users
// @acces  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);
    
    res.status(201).json({
        success: true,
        data: user
    });
});

// @desc   Update users    
// @route  PUT /ap1/v1/auth/users/:id
// @acces  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    const { name, email } = req.body;

    const sql = `SELECT
        users.name as name,
        users.emails as email,
        
        FROM users`;

        mysql.query(sql, asyncHandler(async (err, results, fileds) => {

    const user = await User.findByIdAndUpdate(req.params.id,{
        name: name,
        email: email,
    },
     {
        new: true,
        runValidators: true
    });
    
    res.status(200).redirect("/api/v1/users/" + user.id);

    }));
    // res.status(201).json({
    //     success: true,
    //     data: user
    // });
});

// @desc   Delete users    
// @route  PUT /ap1/v1/auth/users/:id
// @acces  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);
    
    res.status(200).redirect('/api/v1/register');
    // res.status(200).json({
    //     success: true,
    //     data: {}
    // });
});
