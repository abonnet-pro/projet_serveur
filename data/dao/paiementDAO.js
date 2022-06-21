const BaseDAO = require('./baseDAO')

module.exports = class PaiementDAO extends BaseDAO {

    constructor(db) {
        super(db, "paiement")
    }

    getByAbonnement(abonnementId) {
        return new Promise((resolve, reject) =>
            this.db.query("SELECT * FROM paiement WHERE abonnementid=$1", [ abonnementId ])
                .then(res => resolve(res.rows[0]) )
                .catch(e => reject(e)))
    }

    insert(paiement) {
        return new Promise((resolve, reject) => {
            this.db.query("INSERT INTO paiement(abonnementId, type, montantPaye, datePaiement, transactionId, montantRembourse) VALUES($1, $2, $3, $4, $5) RETURNING ID",
                [paiement.abonnementId, null, null, null, null, null])
                .then(res => resolve(res.rows[0].id))
                .catch(err => reject(err))
        })
    }

    update(paiement) {
        return this.db.query("UPDATE paiement SET type=$2, montantPaye=$3, datePaiement=$4, transactionId=$5, montantrembourse=$6 WHERE id=$1",
            [paiement.id, paiement.type, paiement.montantpaye, paiement.datepaiement, paiement.transactionid, paiement.montantrembourse])
    }
}