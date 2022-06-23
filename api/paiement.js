const Communication = require("../data/model/communication")

module.exports = (app, paiementService, abonnementService, clientService, communicationService, publicationService, role, dirName, jwt) => {

    app.get('/api/paiement/:id', jwt.validateJWT, async (req, res) => {
        try
        {
            let paiement = await paiementService.dao.getById(req.params.id)
            if(paiement === undefined) {
                return res.status(400).send("Impossible de trouver le paiement")
            }

            let abonnement = await abonnementService.dao.getById(paiement.abonnementid)
            if(abonnement === undefined) {
                return res.status(400).send("Erreur inconnue")
            }

            let client = await clientService.dao.getById(abonnement.clientid)
            if(client === undefined) {
                return res.status(400).send("Erreur inconnue")
            }

            if(req.user.role === "CLIENT" && client.id !== req.user.id) {
                return res.status(401).end()
            }

            const paiementDTO = {
                id: paiement.id,
                montantPaye: paiement.montantpaye
            }
            return res.json(paiementDTO)

        } catch (e) {
            res.status(400).end()
        }
    })

    app.post('/api/paiement/valider', async (req, res) => {
        try
        {
            let retourPaiement = req.body
            if(!retourPaiement.cid) {
                return res.status(400).end()
            }

            let paiement = await paiementService.dao.getById(retourPaiement.cid)
            if(paiement === undefined) {
                return res.status(400).end()
            }

            let abonnement = await abonnementService.dao.getById(paiement.abonnementid)
            if(abonnement === undefined) {
                return res.status(400).end()
            }

            let publication = await publicationService.dao.getById(abonnement.publicationid)
            if(publication === undefined) {
                return res.status(400).end()
            }

            let client = await clientService.dao.getById(abonnement.clientid)
            if(client === undefined) {
                return res.status(400).end()
            }

            paiement.type = retourPaiement.type
            paiement.montantpaye = retourPaiement.amount
            paiement.transactionid = retourPaiement.transaction
            paiement.datepaiement = new Date()

            paiementService.dao.update(paiement)
                .then(_ => {
                    abonnement.paye = true
                    abonnement.actif = true
                    abonnementService.dao.update(abonnement)
                        .then(_ => {
                            communicationService.envoyerMailPaiement(client, abonnement, paiement, publication)
                                .then(async _ => {
                                    await communicationService.dao.insert(new Communication("EMAIL", client.id, `PAIEMENT_${paiement.id}`, new Date()))
                                    await communicationService.dao.insert(new Communication("COURRIER", client.id, `ENVOI_ABONNEMENT_${abonnement.id}`, new Date()))
                                    res.status(200).end()
                                })
                                .catch(e => {
                                    console.log(e)
                                    res.status(400).end()
                                })
                        })
                        .catch(e => {
                            console.log(e)
                            paiementService.dao.delete(paiement.id)
                            res.status(400).end()
                        })
                })
                .catch(e => {
                    console.log(e)
                    paiementService.dao.delete(paiement.id)
                    res.status(400).end()
                })
        } catch (e) {
            paiementService.dao.delete(paiement.id)
            res.status(400).end()
        }
    })

    app.post('/api/paiement/:id/rembourser', jwt.validateJWT, role.employe, async (req, res) => {
        try
        {
            let paiement = await paiementService.dao.getById(req.params.id)
            if(paiement === undefined) {
                return res.status(400).send("Impossible de trouver le paiement")
            }

            if(paiement.montantrembourse) {
                return res.status(400).send("Le paiement a déjà été remboursé")
            }

            let abonnement = await abonnementService.dao.getById(paiement.abonnementid)
            if(abonnement === undefined) {
                return res.status(400).send("Erreur inconnue")
            }

            if(!abonnement.paye) {
                return res.status(400).send("L'abonnement n'a pas été payé'")
            }

            if(!abonnement.dateresiliation) {
                abonnement.dateresiliation = new Date()
            }

            let client = await clientService.dao.getById(abonnement.clientid)
            if(client === undefined) {
                return res.status(400).send("Erreur inconnue")
            }

            let publication = await publicationService.dao.getById(abonnement.publicationid)
            if(publication === undefined) {
                return res.status(400).send("Erreur inconnue")
            }

            paiementService.rembourserPaiement(paiement, abonnement)
                .then(_ => {
                    abonnement.actif = false
                    abonnement.rembourse = true
                    abonnementService.dao.update(abonnement)
                        .then(_ => {})
                        .catch(e => {
                            console.log(e)
                            res.status(400).end()
                        })
                    paiementService.dao.update(paiement)
                        .then(async _ => {
                            await communicationService.envoyerMailRemboursement(client, paiement, publication)
                            await communicationService.dao.insert(new Communication("EMAIL", client.id, `REMBOURSEMENT_${paiement.id}`, new Date()))
                            res.status(200).end()
                        })
                        .catch(e => {
                            console.log(e)
                            res.status(400).end()
                        })
                })
                .catch(e => {
                    console.log(e)
                    res.status(400).end()
                })
        } catch (e) {
            res.status(400).end()
        }
    })
}