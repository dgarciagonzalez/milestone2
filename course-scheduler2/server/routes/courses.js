// routes/courses.js
// All five CRUD routes plus search -- mysql2 with parameterized queries
const express = require('express')
const router = express.Router()
const pool = require('../util/database')
const validateCourse = require("../util/validateCourse");

// GET all courses
router.get('/courses', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM courses')
        res.json(rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// GET search by title -- must come BEFORE /courses/:id
router.get('/courses/search/:term', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM courses WHERE title LIKE ?',
            [`%${req.params.term}%`]
        )
        res.json(rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// GET single courses by id
router.get('/courses/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM courses WHERE id = ?',
            [req.params.id]
        )
        if (rows.length === 0) return res.status(404).json({ error: 'Course not found' })
        res.json(rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// POST -- create a new course
router.post('/courses', async (req, res) => {
    const error = validateCourse(req.body)
    if (error) return res.status(400).json({ error })

    const { number, title, credits, description } = req.body
    try {
        const [result] = await pool.query(
            'INSERT INTO courses ( number, title, credits, description) VALUES (?, ?, ?, ?)',
            [number ,title, parseInt(credits), description]
        )
        const [rows] = await pool.query(
            'SELECT * FROM courses WHERE id = ?', [result.insertId]
        )
        res.status(201).json(rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// PUT -- update an existing course
router.put('/courses/:id', async (req, res) => {
    const error = validateCourse(req.body)
    if (error) return res.status(400).json({ error })

    const { number, title, credits, description } = req.body
    const id = parseInt(req.params.id)
    try {
        const [result] = await pool.query(
            'UPDATE courses SET number=?, title=?, credits=?, description=? WHERE id=?',
            [number ,title, parseInt(credits), description, id]
        )
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Course not found' })
        const [rows] = await pool.query(
            'SELECT * FROM courses WHERE id = ?', [id]
        )
        res.json(rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// DELETE -- remove a course
router.delete('/courses/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        const [rows] = await pool.query(
            'SELECT * FROM courses WHERE id = ?', [id]
        )
        if (rows.length === 0) return res.status(404).json({ error: 'Course not found' })
        await pool.query('DELETE FROM courses WHERE id = ?', [id])
        res.json(rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
