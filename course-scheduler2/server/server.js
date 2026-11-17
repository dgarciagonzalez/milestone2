// server.js
// Load .env FIRST -- before anything reads process.env
require('dotenv').config()

const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors({origin:process.env.CLIENT_ORIGIN}))
app.use(express.json())

if (process.env.DEBUG) {
    app.use((req, res, next) => { console.log(req.method, req.url); next() })
}

app.use('/api', require('./routes/courses'))
app.use('/api', require('./routes/completions'))

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Courses API running on http://localhost:${PORT}`)
})