const path = require('path');
const express = require("express");
const dotenv = require("dotenv"); 
const morgan = require("morgan");
const colors = require("colors");
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const methodOverride = require("method-override");
const connectMYSQL = require('./config/mysqldb');
const session = require('express-session'); 

const { currentUser } = require('./middleware/auth');

const bodyParser = require("body-parser");

const flash = require('connect-flash'); 

//Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to noSQL databese
connectDB();


///////////////////////////////////////



const mysql   = require('mysql2');
// Connect to mySQL databese
const mysqlConnection = connection = mysql.createConnection({ host: '127.0.0.1', user: 'root', password: 'dell123', database: 'nosql' });

mysqlConnection.connect();

module.exports = mysqlConnection;


/////////////////////////////////////
// const mongodb = require('mongodb');

// let mongoClient = null;

// mongodb.MongoClient.connect(
//     'MONGO_URI',
//     { useUnifiedTopology: true },
//     function(err, client) {
//         mongoClient = client;
//     }
// );

///////////////////////////////////////

connectMYSQL.authenticate().then(() =>
    console.log('Connection has been established successfully. MySQL connected.'.bgMagenta.bold))
    .catch (error =>
    console.error('Unable to connect to the database:'.bgRed.bold, error))
  

//Route Files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');


const app = express();

// // SQL
// app.get('/mysql', (req, res) => {
//     const sql = 'SELECT * FROM careers';

//     connectMYSQL.query(sql, (err, result) => {
//         if(err) throw err;
//         res.send(result);
//     });
// });

// exress-session
app.use(session({ 
    secret:'geeksforgeeks', 
    saveUninitialized: true, 
    resave: true
})); 


// Wiew engine
app.set("view engine", "ejs");
// app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: true}));

// Body parser
app.use(express.json());

// Method Override
app.use(methodOverride("_method"));

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

/// File uploading
app.use(fileupload());

//Sanitize data
app.use(mongoSanitize());

//Set security headers 
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

// Rate limiting
// const limiter = rateLimit({
//     windowMs: 10 * 60  * 1000, // 10 min
//     max: 100
// });

// app.use(limiter);

// Prevent http param pollution
app.use(hpp());




// Set static folder
app.use(express.static(path.join(__dirname, 'public')));



// Enable CORS
app.use(cors());

//FLash
app.use(flash()); 

// Current User function
// app.use(function(req, res, next) {
//     res.locals.user = req.user;
//     res.locals.error = req.flash("error");
//     res.locals.success = req.flash("success");
//     next();
//   });

//Mount roters
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

// Back to index.ejs
app.get("/", function(req, res){
    res.redirect("/api/v1/bootcamps");
});

// Render login page
app.get("/api/v1/login", currentUser, function(req, res){
    res.render("login", {currentUser: req.currentUser, message: req.flash("error")});
});

// Render register page
app.get("/api/v1/register", currentUser, function(req, res){
    res.render("register", {currentUser: req.currentUser, message: req.flash("error")});
    res.redirect('/api/v1/login');
});



//Error Handler allways goes after roters
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.bgBlue.bold));


// Handle unhendled promise rejection
process.on('unhandledRejection', (err, promise ) => {
    console.log(`Error: ${err.message}`.red);
    // Close server and exit proces
    server.close(() => process.exit(1));
});
