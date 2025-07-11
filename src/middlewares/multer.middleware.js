const multer = require('multer');
const path = require('path');
const apiError = require('../utils/apiError');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const fileName = `${uniqueSuffix}-${file.originalname}${ext}`;
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new apiError(400, 'Invalid file type.'));
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 10 MB
  },
  fileFilter: fileFilter
});  

module.exports = upload;