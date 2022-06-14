module.exports = class Paiement {

    constructor(abonnementId)
    {
        this.id = null
        this.abonnementId = abonnementId
        this.type = null
        this.montantPaye = null
        this.transactionId = null
        this.montantRembourse = null
    }
}