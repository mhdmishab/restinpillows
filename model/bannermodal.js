const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bannerSchema = new Schema({
    offerType:{
        type:String,
        required:true
    },
    bannerText:{
        type:String,
        required:true
    },
    couponName:{
        type:mongoose.Types.ObjectId,
        ref:'coupon',
        required:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
},
    {
        timestamps:true
    }
    );

    const banner = mongoose.model('banner',bannerSchema)
    module.exports = banner;