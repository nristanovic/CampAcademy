const { getMe } = require("../controllers/auth");
const { model } = require("../models/Bootcamp");

const jwt = require('jsonwebtoken');

const advancedResults = (model, populate) => async ( req, res, next) => {
    
    let query;

    //Copy req.query
    const reqQuery = { ...req.query};

    //Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    //Loop over removeFields and delete them from reqQuery  
    removeFields.forEach(param => delete reqQuery[param]);


    //Create query string
    let queryStr = JSON.stringify(reqQuery);

    //Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Find resource
    query = model.find(JSON.parse(queryStr));

    // Select Fields
    if(req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    //Sort
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else {
        query = query.sort('-createdAt');
    }

    //Pagination
    const page  = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 4;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    if(populate) {
        query = query.populate(populate);
    }

    //Executing query
    const results = await query;

    //Pagination result
    const pagination = {};

    if(endIndex < total) {
        pagination.next = {
            page : page + 1,
            limit
        }
    }

    if(startIndex > 0){
        pagination.prev = {
            page: page -1,
            limit
        }
    }



    // let token;

    // if(
    //     req.headers.authorization &&
    //     req.headers.authorization.startsWith('Bearer')
    // ){  
    //     // Set token from Bearer token in header
    //     token = req.headers.authorization.split(' ')[1];
    // }

    // // Make sure token exists
    // if(token){
    //     const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //     console.log(decoded);

    //     req.currentUser = await User.findById(decoded.id);
    //     next();

    // }
    
        // Verify token
        
    

    res.advancedResults = {
        results: results, 
        pagination: pagination, 
        startIndex: startIndex, 
        endIndex: endIndex, 
        total: total, 
        limit: limit,
        currentUser: req.currentUser,
         message: req.flash("error")
    };

        // res.status(200).render('bootcamps', {bootcamps: results, pagination: pagination, startIndex: startIndex, endIndex: endIndex, total: total, limit: limit});
    

    // res.advancedResults = {
    //     succes: true,
    //     count: results.length,
    //     pagination,
    //     data: results
    // }

    next();
};

module.exports = advancedResults;