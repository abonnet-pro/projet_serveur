const path = require('path');
const fs = require('fs');
const multer = require('multer')
const upload = multer({dest: 'asset/images/'})

module.exports = (app, publicationService, role, dirName, jwt) => {

    app.post('/upload', jwt.validateJWT, role.employe, upload.single('image'), async (req, res) => {
        if (!req.file) {
            return res.status(400).send("Aucune image selectionné");
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
                res.status(400).send("Images png seulement")
            })
        }
    })

    app.get('/publication', jwt.validateJWT, async (req, res) => {
        try
        {
            const publications = await publicationService.dao.getAll()
            if(publications === undefined) {
                return res.status(404).end()
            }
            return res.json(publications)
        } catch (e) {
            res.status(400).end()
        }
    })

    app.get('/publication/:id', jwt.validateJWT, async (req, res) => {
        try
        {
            const publication = await publicationService.dao.getById(req.params.id)
            if(publication === undefined) {
                return res.status(400).send("Impossible de trouver la publication")
            }

            return res.json(publication)
        } catch (e) {
            res.status(400).end()
        }
    })

    app.post('/publication', jwt.validateJWT, role.employe, (req, res) => {
        const publication = req.body
        if(!publicationService.isValid(publication)) {
            return res.status(400).send("Informations invalides")
        }

        publicationService.dao.insert(publication)
            .then(publicationId => {
                publicationService.dao.getById(publicationId)
                    .then(publication => res.json(publication))
                    .catch(e => {
                        console.log(e)
                        res.status(500).end()
                    })
            })
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })

    app.patch('/publication/:id', jwt.validateJWT, role.employe, async (req, res) => {
        const publication = await publicationService.dao.getById(req.params.id)
        if(!publication) {
            return res.status(400).send("Impossible de trouver la publication")
        }

        publicationService.patchPublication(publication, req.body)
        publicationService.dao.update(publication)
            .then(() => {
                publicationService.dao.getById(publication.id)
                    .then(publication => res.json(publication))
                    .catch(e => {
                        console.log(e)
                        res.status(500).end()
                    })
            })
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })

    app.delete("/publication/:id", jwt.validateJWT, role.employe, async (req, res) => {
        try
        {
            const publication = await publicationService.dao.getById(req.params.id)
            if (publication === undefined) {
                return res.status(400).send("Impossible de trouver la publication")
            }

            publicationService.dao.delete(req.params.id)
                .then(res.status(200).end())
                .catch(e => {
                    console.log(e)
                    res.status(500).end()
                })
        } catch(e) {
            console.log(e)
            return res.status(400).end()
        }
    })
}