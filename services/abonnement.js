const AbonnementDAO = require("../data/dao/abonnementDAO")
const Abonnement = require("../data/model/abonnement")

module.exports = class AbonnementService {
    constructor(db) {
        this.dao = new AbonnementDAO(db)
    }
}