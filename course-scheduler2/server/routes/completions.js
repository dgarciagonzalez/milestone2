const express = require('express')
const router = express.Router()
const pool = require('../util/database')
const {getCoursesWithPrereqs, replaceCompletions} = require("../util/courseData");

const USER_ID = 1 //M3: replaced by the logged-in user's id

const isValidCompletionSet = (courses, completed) =>{
    return completed.every(id => {
        const course = courses.find(c => c.id === id)
        return course && course.prerequisites.every(prereq => completed.includes(prereq))
    })
}

router.get('/completions', async (req, res) => {
    try{
        const [rows] = await pool.query(
            'SELECT course_id FROM completions WHERE user_id = ? ORDER BY course_id',
            [USER_ID]
        )
        res.json(rows.map(r => r.course_id))
    } catch (err){
        res.status(500).json({error: err.message})
    }
})

router.put('/completions', async (req, res) => {
    const body = req.body
    if(!Array.isArray(body) || !body.every(Number.isInteger)){
        return res.status(400).json({error: 'Body must be an array of course IDs'})
    }
    const completed = [...new Set(body)].sort((a, b) => a - b)

    try{
        const courses = await getCoursesWithPrereqs(pool)

        if(!isValidCompletionSet(courses, completed)){
            return res.status(400).json({
                error: 'Invalid completion list: a course is missing a prerequisite'
            })
        }

        await replaceCompletions(pool, USER_ID, completed)
        res.json(completed)
    }catch(err){
        res.status(500).json({error: err.message})
    }
})

module.exports = router


