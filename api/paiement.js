module.exports = (app, paiementService, abonnementService, dirName, jwt) => {

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

            paiement.type = retourPaiement.type
            paiement.montantpaye = retourPaiement.amount
            paiement.transactionid = retourPaiement.transaction

            paiementService.dao.update(paiement)
                .then(_ => {
                    abonnement.paye = true
                    abonnement.actif = true
                    abonnementService.dao.update(abonnement)
                        .then(_ => res.status(200).end())
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