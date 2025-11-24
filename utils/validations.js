const validator = require('validator');

function validateSignupData(userData) {
    const {name,password,email} = userData;
    
    if (name.length < 5) {
        throw new Error('Invalid name (must be at least 5 characters)');
    }
    if (!validator.isEmail(email)) {
        throw new Error('Invalid email address');
    }
    if (!validator.isStrongPassword(password)) {
        throw new Error('Please enter a stronger password');
    }
}
module.exports = {validateSignupData}