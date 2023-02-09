const mongoose=require('mongoose');
const dotenv=require('dotenv');
dotenv.config();
mongoose.set('strictQuery',false);

module.exports={
    dbConnect:()=>{
        mongoose.connect(process.env.MONGODB_URL,{
            useNewUrlParser:true,
            useUnifiedTopology:true,

        })
        .then(()=>{
            console.log('Database connected successfully');
        })
        .catch((err)=>{
            console.log("error"+err);
        })
        mongoose.connection.on('connected',()=>{
            console.log('MongoDB Connected');
        })
        mongoose.connection.on('disconnected',()=>{
            console.log('MonogoDB Disconnected');
        })
    },
}







