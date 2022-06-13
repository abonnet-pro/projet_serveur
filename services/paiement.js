const PaiementDAO = require("../data/dao/paiementDAO")
const Paiement = require("../data/model/paiement")

module.exports = class PaiementService {
    constructor(db) {
        this.dao = new PaiementDAO(db)
    }
}