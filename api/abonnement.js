module.exports = (app, abonnementService, publicationService, clientService, dirName, jwt) => {

    app.get('/abonnement', jwt.validateJWT , async (req, res) => {
        try
        {
            let abonnements;
            let actif = req.query.actif
            let paye = req.query.paye

            abonnements = await abonnementService.getAll(req.user, actif, paye)

            if(abonnements === undefined) {
                return res.status(404).end()
            }

            const abonnementsDTO = await abonnementService.getAbonnementsDTO(abonnements, publicationService, clientService)
            return res.json(abonnementsDTO)
        } catch (e) {
            res.status(400).end()
        }
    })

    app.get('/abonnement/:id', jwt.validateJWT , async (req, res) => {
        try
        {
            let abonnement = await abonnementService.dao.getById(req.params.id)
            if(abonnement === undefined) {
                return res.status(400).send("Impossible de trouver l'abonnement")
            }

            if(req.user.role === "CLIENT" && abonnement.clientid !== req.user.id) {
                return res.status(401).end()
            }

            const abonnementDTO = await abonnementService.getAbonnementsDTO([abonnement], publicationService, clientService)
            return res.json(abonnementDTO[0])

        } catch (e) {
            res.status(400).end()
        }
    })

    app.post('/abonnement/:id/arreter', jwt.validateJWT , async (req, res) => {
        try
        {
            let abonnement = await abonnementService.dao.getById(req.params.id)
            if(abonnement === undefined) {
                return res.status(400).send("Impossible de trouver l'abonnement")
            }

            if(req.user.role === "CLIENT" && abonnement.clientid !== req.user.id) {
                return res.status(401).end()
            }

            if(abonnement.dateresiliation) {
                return res.status(400).send("L'abonnement a déjà été résilié")
            }

            if(!abonnement.actif) {
                return res.status(400).send("L'abonnement n'est pas en cours")
            }

            abonnementService.arreterAbonnement(abonnement)
                .then(() => {
                    abonnementService.getAbonnementsDTO([abonnement], publicationService, clientService)
                        .then(abonnementDTO => res.json(abonnementDTO[0]))
                        .catch(e => {
                            console.log(e)
                            res.status(500).end()
                        })
                })
                .catch(e => {
                    console.log(e)
                    res.status(500).end()
                })
        } catch (e) {
            res.status(400).end()
        }
    })

    app.post('/abonnement/:id/relancer', jwt.validateJWT , async (req, res) => {
        try
        {
            let abonnement = await abonnementService.dao.getById(req.params.id)
            if(abonnement === undefined) {
                return res.status(400).send("Impossible de trouver l'abonnement")
            }

            if(req.user.role === "CLIENT" && abonnement.clientid !== req.user.id) {
                return res.status(401).end()
            }

            if(!abonnement.actif) {
                return res.status(400).send("L'abonnement n'est pas en cours")
            }

            abonnementService.relancerAbonnement(abonnement)
                .then(() => {
                    abonnementService.getAbonnementsDTO([abonnement], publicationService, clientService)
                        .then(abonnementDTO => res.json(abonnementDTO[0]))
                        .catch(e => {
                            console.log(e)
                            res.status(500).end()
                        })
                })
                .catch(e => {
                    console.log(e)
                    res.status(500).end()
                })
        } catch (e) {
            res.status(400).end()
        }
    })
}