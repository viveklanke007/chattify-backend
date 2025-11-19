// const multer = require("multer");
// const path = require("path");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     let folder = "others";
//     if (file.mimetype.startsWith("image/")) folder = "images";
//     else if (file.mimetype.startsWith("video/")) folder = "videos";
//     else folder = "docs";

//     //cb(null, path.join(__dirname, "./public/uploads", folder));
//     cb(null, path.join(__dirname, "../public/avatar"));
//   },

//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage });
// module.exports = upload;

const multer = require("multer");
const path = require("path");

// Temporary local storage (safe for Render)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../temp")); // only TEMP folder
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

const upload = multer({ storage });

module.exports = upload;
