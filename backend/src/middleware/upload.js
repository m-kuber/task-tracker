// backend/src/middleware/upload.js
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = crypto.randomBytes(12).toString('hex');
    cb(null, `${name}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|plain|text/;
  const mime = String(file.mimetype || '').toLowerCase();
  const subtype = mime.includes('/') ? mime.split('/')[1] : mime;
  const ext = path.extname(file.originalname || '').slice(1).toLowerCase();

  if (allowed.test(mime) || allowed.test(subtype) || allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
}

const limits = {
  fileSize: 10 * 1024 * 1024 // 10 MB
};

const upload = multer({ storage, fileFilter, limits });

module.exports = { upload, UPLOAD_DIR };
