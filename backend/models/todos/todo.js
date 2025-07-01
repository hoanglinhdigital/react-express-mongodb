/**
 * Created by Syed Afzal
 */
const mongoose = require('mongoose');

const Todo = mongoose.model('Todo', {
    text : {
        type: String,
        trim: true,
        required: true
    },
    done : {
        type: Boolean,
        default: false
    }
});

module.exports = {Todo};
