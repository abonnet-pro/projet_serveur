const Paiement = require("../data/model/paiement")
const Communication = require("../data/model/communication")

module.exports = (app, abonnementService, publicationService, clientService, paiementService, communicationService, role, dirName, jwt) => {

    app.get('/api/abonnement', jwt.validateJWT , async (req, res) => {
        try
        {
            let abonnements;
            let actif = req.query.actif
            let paye = req.query.paye
            let client = req.query.user

            abonnements = await abonnementService.getAll(req.user, actif, paye, client)

            if(abonnements === undefined) {
                return res.status(404).end()
            }

            const abonnementsDTO = await abonnementService.getAbonnementsDTO(abonnements, publicationService, clientService)
            return res.json(abonnementsDTO)
        } catch (e) {
            res.status(400).end()
        }
    })

    app.get('/api/abonnement/:id', jwt.validateJWT , async (req, res) => {
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

    app.post('/api/abonnement/:id/arreter', jwt.validateJWT , async (req, res) => {
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

    app.post('/api/abonnement/:id/relancer', jwt.validateJWT , async (req, res) => {
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

    app.post('/api/abonnement/:id/payer', jwt.validateJWT, async (req, res) => {
        try
        {
            let abonnement = await abonnementService.dao.getById(req.params.id)
            let cardInformations = req.body

            if(abonnement === undefined) {
                return res.status(400).send("Impossible de trouver l'abonnement")
            }

            if(!paiementService.isValid(cardInformations)) {
                return res.status(400).send("Informations invalides")
            }

            if(req.user.role === "CLIENT" && abonnement.clientid !== req.user.id) {
                return res.status(401).end()
            }

            if(abonnement.paye) {
                return res.status(400).send("L'abonnement a déjà été payé")
            }

            let publication = await publicationService.dao.getById(abonnement.publicationid)

            if(publication === undefined) {
                return res.status(400).send("Erreur inconnue")
            }

            const paiement = new Paiement(abonnement.id)
            paiement.id = await paiementService.dao.insert(paiement)

            paiementService.payerAbonnement(paiement, cardInformations, publication)
                .then(_ => res.json(paiement))
                .catch(async e => {
                    await paiementService.dao.delete(paiement.id)
                    if(e.response.status === 409) {
                        return res.status(400).send("URL de retour du service introuvable")
                    }
                    return res.status(400).end()
                })
        } catch (e) {
            res.status(400).end()
        }
    })

    app.post('/api/abonnement/:id/relancer/mail', jwt.validateJWT, role.employe, async (req, res) => {
        try
        {
            let abonnement = await abonnementService.dao.getById(req.params.id)

            if(abonnement === undefined) {
                return res.status(400).send("Impossible de trouver l'abonnement")
            }

            if(abonnement.paye) {
                return res.status(400).send("L'abonnement a déjà été payé")
            }

            let publication = await publicationService.dao.getById(abonnement.publicationid)

            if(publication === undefined) {
                return res.status(400).send("Erreur inconnue")
            }

            let client = await clientService.dao.getById(abonnement.clientid)

            if(client === undefined) {
                return res.status(400).send("Erreur inconnue")
            }

            communicationService.envoyerMailRelance(client, abonnement, publication)
                .then(async _ => {
                    await communicationService.dao.insert(new Communication("EMAIL", client.id, `RELANCE_ABONNEMENT_${abonnement.id}`, new Date()))
                    res.status(200).end()
                })
                .catch(err => {
                    console.log(err)
                    res.status(400).end()
                })
        } catch (e) {
            console.log(e)
            res.status(400).end()
        }
    })
}