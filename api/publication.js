const path = require('path');
const fs = require('fs');
const multer = require('multer')
const upload = multer({dest: 'asset/images/'})

module.exports = (app, publicationService, role, dirName, jwt) => {

    app.post('/upload', jwt.validateJWT, role.employe, upload.single('image'), async (req, res) => {
        if (!req.file) {
            return res.status(500).send("Aucune image selectionné");
        }

        const tempPath = req.file.path
        const targetPath = req.file.path + ".png"

        if (path.extname(req.file.originalname).toLowerCase() === ".png") {
            fs.rename(tempPath, targetPath, err => {
                if(err) return res.status(500)
                res.status(200).json({ imgUpload: req.file.filename + ".png" })
            })
        } else {
            fs.unlink(tempPath, err => {
                if(err) return res.status(500)
                res.status(500).send("Images png seulement")
            })
        }
    })
}