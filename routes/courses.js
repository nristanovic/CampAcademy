const express = require('express');
const { getCourseForEdit, addCoursePage, getCourses, getCourse, addCourse, updateCourse, deleteCourse } = require('../controllers/courses');


const Course = require('../models/Course');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize, currentUser } = require('../middleware/auth');

router.route('/').get(currentUser, advancedResults(Course, {
    path: 'bootcamp',
    select: 'name description'
}), 
getCourses).post(protect, authorize('publisher', 'admin'), addCourse);
router.route('/:id').get(getCourse).put(currentUser, protect, authorize('publisher', 'admin'), updateCourse).delete(protect, authorize('publisher', 'admin'), deleteCourse);

router.route('/add/:bootcampId/course').get(currentUser, protect, authorize('publisher', 'admin'), addCoursePage)

router.route('/:id/edit').get(currentUser, protect, authorize('publisher', 'admin'), getCourseForEdit)

module.exports = router;