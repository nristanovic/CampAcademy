const express = require('express');
const { manageReviews, addReviewPage, getReviews, getReview, addReview, updateReview, deleteReview } = require('../controllers/reviews');


const Review = require('../models/Review');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { currentUser, protect, authorize } = require('../middleware/auth');
const { route } = require('./courses');

router.route('/')
    .get(currentUser, advancedResults(Review, {
        path: 'bootcamp',
        select: 'name description'
        }),
        getReviews)
    .post(currentUser, protect, authorize('user', 'admin'), addReview);

    
router.route('/:id')
.get(currentUser, getReview)
.put(currentUser, protect, authorize('user', 'admin'), updateReview)
.delete(currentUser, protect, authorize('user', 'admin'), deleteReview);


router.route('/add/:bootcampId/review').get(currentUser, protect, authorize('user', 'admin'), addReviewPage)

router.route('/:id/manage').get(protect, authorize('user', 'admin'), manageReviews);

module.exports = router;