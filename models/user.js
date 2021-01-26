const mongoose = require('mongoose')
const autoIncrement = require('mongoose-sequence')(mongoose)
const passportLocalMongoose = require('passport-local-mongoose')
const userSchema = new mongoose.Schema({
    userId: Number,
    name: String,
    password:{
        type: String,
        select: false
    },
    designation: String,
    employee_id: String,
    dept :{
        type :Object,
        enum : ['Electrical Department','Mechanical Department','Operations Department']
    },
    isVerified: String,
    isAdmin: Boolean,
    resetPasswordToken : String,
    resetPasswordExpires : Date

})

userSchema.plugin(passportLocalMongoose,{usernameField : 'employee_id'})
userSchema.plugin(autoIncrement,{inc_field : "userId",start_seq : 1})

module.exports = mongoose.model('User',userSchema)