const mongoose=require('mongoose')

const productSchema=new mongoose.Schema({
    image1:
        {type:String,
        required:true

        },
        image2:
        {type:String,
        required:true

        },
        image3:
        {type:String,
        required:true

        },
    productname:
        {type:String,
        required:true,
        trim: true,},
    category:
        {type:mongoose.SchemaTypes.ObjectId,
        ref:"categorys"},
    quantity:
        {type:Number,
        required:true},
    description:
        {type:String,
        required:true},
    price:{
        type:Number,
        required:true,
        trim: true,},
    unlist:{type:Boolean,default:false,required:true}
    

})

module.exports=mongoose.model('products',productSchema);

