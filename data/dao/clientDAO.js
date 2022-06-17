const BaseDAO = require('./baseDAO')

module.exports = class ClientDAO extends BaseDAO
{
    constructor(db) {
        super(db, "client")
    }

    insert(client) {
        return new Promise((resolve, reject) =>
            this.db.query("INSERT INTO client(nom, prenom, displayName, login, dateNaissance, lieuNaissance, rue, cp, ville, challenge, role, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING ID",
                [client.nom, client.prenom, client.displayName, client.login, client.dateNaissance, client.lieuNaissance, client.rue, client.cp, client.ville, client.challenge, client.role, client.active])
                .then(res => resolve(res.rows[0].id) )
                .catch(e => reject(e)))
    }

    getByLogin(login) {
        return new Promise((resolve, reject) =>
            this.db.query("SELECT * FROM client WHERE login=$1", [ login ])
                .then(res => resolve(res.rows[0]) )
                .catch(e => reject(e)))
    }

    update(client) {
        return this.db.query("UPDATE client SET nom=$2, prenom=$3, displayName=$4, login=$5, dateNaissance=$6, lieuNaissance=$7, rue=$8, cp=$9, ville=$10 WHERE id=$1",
            [client.id, client.nom, client.prenom, client.displayname, client.login, client.datenaissance, client.lieunaissance, client.rue, client.cp, client.ville])
    }

    active(clientId) {
        return this.db.query("UPDATE client SET active = true WHERE id=$1",
            [clientId])
    }

    desactive(clientId) {
        return this.db.query("UPDATE client SET active = false WHERE id=$1",
            [clientId])
    }

    getAll() {
        return new Promise((resolve, reject) => {
            this.db.query("SELECT * FROM client")
                .then(res => resolve(res.rows))
                .catch(err => reject(err))
        })
    }
}