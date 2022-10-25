const multer = require('multer');
const path = require('path')

// Utilisation de Multer
const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './Images/')
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
module.exports.upload = multer({
    storage: storage
});
