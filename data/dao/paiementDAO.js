const BaseDAO = require('./baseDAO')

module.exports = class PaiementDAO extends BaseDAO {

    constructor(db) {
        super(db, "paiement")
    }
}