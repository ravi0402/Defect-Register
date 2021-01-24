const mongoose = require('mongoose')
const autoIncrement = require('mongoose-sequence')(mongoose)

const defectSchema = new mongoose.Schema({
    number :{
        type : Number
    },
    member :{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Member',
        required: true
    },
    priority:{
        type : Object,
        required: true,
        enum :['1','2','3','4']
    },
    createdOn:{
        type: Date,
        default : Date.now
    },
    state :{
        type : Object,
        required : true,
        enum : ["Assigned","Work in progress","Resolved","Canceled"]
    },
    points:{
        type : String
    },
    environment :{
        type :Object,
        required:true,
        enum : ['Dev','QA','UAT','Prod']
    },
    product:{
        type:String
    },
    shortDescription:{
        type:String
    },
    description:{
        type:String
    }
})

defectSchema.plugin(autoIncrement,{inc_field : "number",start_seq : 1000})
module.exports = mongoose.model('Defect',defectSchema)