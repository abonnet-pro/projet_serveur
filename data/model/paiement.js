module.exports = class Paiement {

    constructor(type, montantPaye, transactionId, montantRembourse)
    {
        this.id = null
        this.type = type
        this.montantPaye = montantPaye
        this.transactionId = transactionId
        this.montantRembourse = montantRembourse
    }
}