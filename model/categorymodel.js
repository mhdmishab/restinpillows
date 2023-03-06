const mongoose=require('mongoose');

const categorySchema=new mongoose.Schema({

    categoryname:{
        type:String,
        required:true,
          trim: true,
    },
    isDeleted:{
        type:Boolean,
        default:false,
        required:true
    }

});

module.exports=mongoose.model('categorys',categorySchema);