const mongoose=require('mongoose');

const subcategorySchema=new mongoose.Schema({

    subcategoryname:{
        type:String,
        required:true,
    },
 
});

module.exports=mongoose.model('subcategorys',subcategorySchema);