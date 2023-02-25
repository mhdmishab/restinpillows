const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination:function(req,res,cb){
        cb(null, "public");
    },
    filename: function (req, file, cb){
        const ext = file.mimetype.split("/")[1];
        cb(
            null,
            `productImages/${Date.now()}${path.extname(file.originalname)}.${ext}`
        );
    },
});

const multerFilter=(req,file,cb)=>{
    if(file.mimetype.split('/')[1]==='jpeg'||
    file.mimetype.split('/')[1]==='jpg'||
    file.mimetype.split('/')[1]==='webp'||
    file.mimetype.split('/')[1]==='png'){
        cb(null,true);
    }else{
        cb(new error("Not a jeg,png or jpg file!!"),false);
    }
}

const upload = multer({ storage: storage,fileFilter:multerFilter});

module.exports = upload;