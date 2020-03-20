const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
  name: {
    // default ?
    // required
    // firstname, lastname
    // type
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error
      }
    }
  },
  email: {
    // email has to be type String, and unique, required, trimmed, toLowerCase, and validated in isEmail
    type: String,
    unique: true,
    required: true,
    trim: true,
    toLowerCase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is not valid')
      }
    }
  },
  age: {
    // age has its type Number, and not to be negative integer, default is zero
    type: Number,
    default: 0,
    min: 0,
    max: 123
  },
  tokens: [{
      token: {
        type: String,
        required: true
      }  
  }]
}, {
  timestamps: true
})

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
})
userSchema.methods.toJSON = function() {
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens

  return userObject
}

userSchema.methods.generateAuthToken = async function() {
  // token generated
  const user = this
  const token = jwt.sign({ _id: user.id.toString() }, 'thisisnewcourse')
  user.tokens = user.tokens.concat({token: token})

  await user.save()
  return token 
}

userSchema.statics.findByCredentials = async (email, password) =>{
  const user = await User.findOne({email})
  
  if(!user) {
    throw new Error('Unable to login')
  }
  const isValidPass = await bcrypt.compare(password, user.password)

  if(!isValidPass) {
    throw new Error('Unable to login')
  }

  return user 
}

userSchema.pre('save', async function(next) {
  // do stuff
  const user = this

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function(next){
  const user = this
  await Task.deleteMany({owner: user._id})
  
  next()
})
const User = mongoose.model('User', userSchema)

module.exports = User