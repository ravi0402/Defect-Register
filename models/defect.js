const mongoose = require('mongoose')
const autoIncrement = require('mongoose-sequence')(mongoose)

const defectSchema = new mongoose.Schema({
    number :{
        type : Number
    },
    createdOn:{
        type: Date,
        default : Date.now
    },
    dept_referred_to: {
        type :Object,
        required:true,
        enum : ["Electrical Department","Mechanical Department","Operations Department"]
    },
    observer :{
        type: String,
        required: true
    },
    priority:{
        type : Object,
        required: true,
        enum :['High','Medium','Low']
    },
    state :{
        type : Object,
        required : true,
        enum : ["Reported", "Acknowledged", "Work in progress","Resolved","Canceled"]
    },
    equipment: {
        type : String
    },
    nature: {
        type : String
    },
    location: {
        type : String
    },
    title:{
        required: true,
        type:String
    },
    description:{
        required: true,
        type:String
    }
})

defectSchema.plugin(autoIncrement,{inc_field : "number",start_seq : 1})
module.exports = mongoose.model('Defect',defectSchema)