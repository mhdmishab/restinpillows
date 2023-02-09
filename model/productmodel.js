const mongoose=require('mongoose')

const productSchema=new mongoose.Schema({
    image:
        {type:Array,
        required:true

        },
    productname:
        {type:String,
        required:true},
    category:
        {type:mongoose.SchemaTypes.ObjectId,
        ref:"categorys"},
    subcategory:
        {type:mongoose.SchemaTypes.ObjectId,
        ref:"subcategorys"},
    quantity:
        {type:Number,
        required:true},
    description:
        {type:String,
        required:true},
    price:{
        type:Number,
        required:true},
    unlist:{type:Boolean,default:false,required:true}
    

})

module.exports=mongoose.model('products',productSchema);

