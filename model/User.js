const { Schema, model } = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: validator.isEmail,
      message: 'Invalid email address',
    },
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: validator.isStrongPassword,
      message: 'Password is not strong enough',
    },
  },
  role: {
    type: String,
    enum: ['user', 'instructor', 'admin'],
    default: 'user',
  },
  profileImage: {
    type: String,
  },
},{timestamps:true});

UserSchema.pre("save", async function(next){
  if(!this.isModified('password')) return next();
  this.password =await bcrypt.hash(this.password,10);
  next();
})

UserSchema.methods.isPasswordMatch = async function(password){
  return  await bcrypt.compare(password,this.password);
}



module.exports = model('User', UserSchema);
