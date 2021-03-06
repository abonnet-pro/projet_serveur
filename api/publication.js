const path = require('path');
const fs = require('fs');
const multer = require('multer')
const upload = multer({dest: 'asset/images/'})

module.exports = (app, publicationService, abonnementService, role, dirName, jwt) => {

    app.post('/api/upload', jwt.validateJWT, role.employe, upload.single('image'), async (req, res) => {
        if (!req.file) {
            return res.status(400).send("Aucune image selectionn√©");
        }

        const tempPath = req.file.path
        const targetPath = req.file.path + path.extname(req.file.originalname).toLowerCase()

        fs.rename(tempPath, targetPath, err => {
            if(err) {
                fs.unlink(tempPath, err => {
                    if(err) return res.status(500)
                    res.status(400).end()
                })
                return res.status(500)
            }
            res.status(200).json({ imgUpload: req.file.filename + path.extname(req.file.originalname).toLowerCase() })
        })
    })

    app.get('/api/upload', jwt.validateJWT, role.employe, async (req, res) => {
        try {
            let directory_name = "asset/images";
            let filenames = fs.readdirSync(directory_name);
            let retour = {
                images: []
            }

            filenames.forEach((file) => {
                retour.images.push(file)
            });

            res.json(retour)
        } catch (e) {
            res.status(400).end()
        }
    })

    app.get('/api/publication', async (req, res) => {
        try
        {
            let publications;
            let active = req.query.active
            let promotion = req.query.promotion
            let titre = req.query.titre

            publications = await publicationService.getAll(active, promotion, titre)

            if(publications === undefined) {
                return res.status(404).end()
            }

            return res.json(publications)
        } catch (e) {
            res.status(400).end()
        }
    })

    app.get('/api/publication/:id', async (req, res) => {
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

    app.post('/api/publication', jwt.validateJWT, role.employe, (req, res) => {
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

    app.patch('/api/publication/:id', jwt.validateJWT, role.employe, async (req, res) => {
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

    app.delete("/api/publication/:id", jwt.validateJWT, role.employe, async (req, res) => {
        try
        {
            const publication = await publicationService.dao.getById(req.params.id)
            if (publication === undefined) {
                return res.status(400).send("Impossible de trouver la publication")
            }

            const abonnements = await abonnementService.dao.getAbonnementByPublication(publication.id)
            if(abonnements !== undefined) {
                return res.status(400).send("Impossible de supprimer, la publication est rattach√© √† une abonnement en cours")
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

    app.post('/api/publication/:id/abonnement', jwt.validateJWT, role.client, async (req, res) => {

        const publication = await publicationService.dao.getById(req.params.id)
        if(publication === undefined) {
            return res.status(400).send("Impossible de trouver la publication")
        }

        const abonnement = await abonnementService.dao.getAbonnementByClientAndPublication(req.user.id, publication.id)
        if(abonnement !== undefined) {
            return res.status(400).send("Vous √™tes d√©ja abonn√© √† cette publication")
        }

        abonnementService.newAbonnement(publication, req.user)
            .then(abonnementId => {
                abonnementService.dao.getById(abonnementId)
                    .then(abonnement => res.json(abonnementService.getAbonnementDTO(abonnement, publication, req.user)))
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
}