const BaseDAO = require('./baseDAO')

module.exports = class PaiementDAO extends BaseDAO {

    constructor(db) {
        super(db, "paiement")
    }

    insert(paiement) {
        return new Promise((resolve, reject) => {
            this.db.query("INSERT INTO paiement(abonnementId, type, montantPaye, transactionId, montantRembourse) VALUES($1, $2, $3, $4, $5) RETURNING ID",
                [paiement.abonnementId, null, null, null, null])
                .then(res => resolve(res.rows[0].id))
                .catch(err => reject(err))
        })
    }

    update(paiement) {
        return this.db.query("UPDATE paiement SET type=$2, montantPaye=$3, transactionId=$4 WHERE id=$1",
            [paiement.id, paiement.type, paiement.montantpaye, paiement.transactionid])
    }
}