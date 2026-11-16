// util/validateCourse.js
// Shared validation for POST and PUT -- returns an error string or null
function validateCourse(body) {
    const { id, number, title, credits, description } = body

    if (!title || !number) {
        return 'title and number are required'
    }
    if (!id || isNaN(parseInt(id))) {
        return 'id must be a whole number'
    }
    if (!credits || isNaN(parseInt(credits))) {
        return 'credits must be a whole number'
    }
    if (!description) {
        return 'course must have a description'
    }
    return null   // null means valid
}

module.exports = validateCourse