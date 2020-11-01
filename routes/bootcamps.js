const express = require('express');
const { addBootcampPage, getBootcampForEdit, getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius, bootcampPhotoUpload } = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');


//Include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');


const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize, currentUser } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);


router.route('/radius').post(currentUser, getBootcampsInRadius);

router.route('/:id/photo').put(currentUser, protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router.route('/').get(currentUser, advancedResults(Bootcamp, 'courses'), getBootcamps).post(currentUser, protect, authorize('publisher', 'admin'), createBootcamp);;

router.route('/:id').get(currentUser, getBootcamp).put(currentUser, protect, authorize('publisher', 'admin'), updateBootcamp).delete(currentUser, protect, authorize('publisher', 'admin'), deleteBootcamp);

router.route('/:id/edit').get(currentUser, protect, authorize('publisher', 'admin'), getBootcampForEdit);

router.route('/add/bootcamp').get(currentUser, protect, authorize('publisher', 'admin'), addBootcampPage);



module.exports = router;