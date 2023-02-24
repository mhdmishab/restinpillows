const mongoose=require('mongoose');

const categorySchema=new mongoose.Schema({

    categoryname:{
        type:String,
        required:true,
        trim: true,
    },
    subcategory:[{
        type:String,
        required:true,
        trim: true,
    }]
    
    
});

module.exports=mongoose.model('categorys',categorySchema);