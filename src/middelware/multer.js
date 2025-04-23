const multer = require("multer")
// const { updateUserDetails } = require("../controller/userController")
const storage = multer.diskStorage({
    destination
    :function(req, res, cb){
        cb(null, "./public/temp")
    },
    filename:function(req, file, cb){
        //  originalname: used to get the file in its original formate
        cb(null, file.originalname)
    }
})

const upload = multer({storage})
module.exports = upload

