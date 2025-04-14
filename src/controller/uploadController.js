const { uploadToS3 } = require("../utils/upload");
const Helper = require("../utils/helper")

const uploadFile = async (req, res) =>{
    try {
<<<<<<< HEAD
        if (!req.files) return Helper.fail(res,'File is required' );
        console.log(req.files)
        // need to change the folder name
        const folderName = req.body.folderName || 'general';
        const fileUrl = await uploadToS3(req.files, folderName);
=======
        if (!req.file) return Helper.fail(res,'File is required' );
        // need to change the folder name
        const folderName = req.body.folderName || 'general';
        const fileUrl = await uploadToS3(req.file, folderName);
>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f
        return Helper.success(res,'File uploaded successfully', {imageUrl:fileUrl});
        }
    catch (error) {
        console.error('File Upload Error:', error);
        return Helper.error(res, error.message );
    }
}

module.exports = { uploadFile };