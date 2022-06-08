module.exports = (app, publicationService, upload, fs, path, dirName, jwt) => {

    app.post('/upload', upload.single('image'), async (req, res) => {
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