const BaseDAO = require('./baseDAO')

module.exports = class AbonnementDAO extends BaseDAO {

    constructor(db) {
        super(db, "abonnement")
    }

    insert(abonnement) {
        return new Promise((resolve, reject) => {
            this.db.query("INSERT INTO abonnement(clientId, publicationId, dateDebut, dateFin, actif, paye, dateResiliation, rembourse) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING ID",
                [abonnement.clientId, abonnement.publicationId, abonnement.dateDebut, abonnement.dateFin, abonnement.actif, abonnement.paye, abonnement.dateResiliation, abonnement.rembourse])
                .then(res => resolve(res.rows[0].id))
                .catch(err => reject(err))
        })
    }

    getAbonnementByClientAndPublication(clientId, publicationId) {
        return new Promise((resolve, reject) =>
            this.db.query("SELECT * FROM abonnement WHERE clientId=$1 and publicationId=$2", [clientId, publicationId])
                .then(res => resolve(res.rows[0]) )
                .catch(e => reject(e)))
    }

    getAbonnementByPublication(publicationId) {
        return new Promise((resolve, reject) =>
            this.db.query("SELECT * FROM abonnement WHERE publicationId=$1 and actif = true", [publicationId])
                .then(res => resolve(res.rows[0]) )
                .catch(e => reject(e)))
    }

    getAbonnementByClient(clientId) {
        return new Promise((resolve, reject) =>
            this.db.query("SELECT * FROM abonnement WHERE clientid=$1", [clientId])
                .then(res => resolve(res.rows) )
                .catch(e => reject(e)))
    }

    getAll(where) {
        return new Promise((resolve, reject) =>
            this.db.query("SELECT * FROM abonnement " + where)
                .then(res => resolve(res.rows) )
                .catch(e => reject(e)))
    }

    update(abonnement) {
        return this.db.query("UPDATE abonnement SET actif=$2, paye=$3, dateResiliation=$4, rembourse=$5 WHERE id=$1",
            [abonnement.id, abonnement.actif, abonnement.paye, abonnement.dateresiliation, abonnement.rembourse])
    }
}