const { uploadToS3 } = require("../utils/upload");
const Helper = require("../utils/helper")

const uploadFile = async (req, res) =>{
    try {
        if (!req.files) return Helper.fail(res,'File is required' );
        console.log(req.files)
        // need to change the folder name
        const folderName = req.body.folderName || 'general';
        const fileUrl = await uploadToS3(req.files, folderName);
        return Helper.success(res,'File uploaded successfully', {imageUrl:fileUrl});
        }
    catch (error) {
        console.error('File Upload Error:', error);
        return Helper.error(res, error.message );
    }
}

module.exports = { uploadFile };