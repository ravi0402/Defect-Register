const mongoose = require('mongoose')
const autoIncrement = require('mongoose-sequence')(mongoose)
const Defect = require('./defect')

const memberSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email :{
        type : String,
        required : true
    },
    dept :{
        type :Object,
        required:true,
        enum : ['Electrical','Mechanical','Operations']
    },
    mobilePhone:{
        type : Number
    },
    designation:{
        type : String,
        required: true
    },
    createdAt:{
        type: Date,
        required : true,
        default : Date.now
    },
    memberID:{
        type: Number
    }
})

memberSchema.plugin(autoIncrement,{inc_field : "memberID",start_seq : 1})

memberSchema.pre('remove',function(next){
    Defect.find({member : this.id},(err,defects)=>{
        if(err){
            next(err)
        }else if(defects.length > 0){
            next(new Error('This Member still has defects assigned to him'))
        }else{
            next()
        }
    })
})

module.exports = mongoose.model('Member',memberSchema)