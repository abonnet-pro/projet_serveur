const BaseDAO = require('./baseDAO')

module.exports = class AbonnementDAO extends BaseDAO {

    constructor(db) {
        super(db, "abonnement")
    }
}