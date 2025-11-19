// const multer = require("multer");
// const path = require("path");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     let folder = "others";
//     if (file.mimetype.startsWith("image/")) folder = "images";
//     else if (file.mimetype.startsWith("video/")) folder = "videos";
//     else if (file.mimetype.startsWith("audio/")) folder = "audios";
//     else folder = "docs";

//     //cb(null, path.join(__dirname, "./public/uploads", folder));
//     cb(null, path.join(__dirname, "../public/uploads/images"));
//   },

//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage });
// module.exports = upload;

const multer = require("multer");
const path = require("path");

// TEMP FOLDER storage only (Render-safe)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../temp")); // temporary folder
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // unique file name
  },
});

const upload = multer({ storage });

module.exports = upload;
