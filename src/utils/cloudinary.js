const appConfig = require('../config/appConfig');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: appConfig.cloudinary.cloudName,
  api_key: appConfig.cloudinary.apiKey,
  api_secret: appConfig.cloudinary.apiSecret,
});


const uploadToCloudinary = async (filePath, folder) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: 'auto',
        });
        return result;
    } catch(error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
}

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
        return result;
    } catch(error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
}

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
}