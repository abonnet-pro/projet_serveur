const BaseDAO = require('./baseDAO')

module.exports = class ClientDAO extends BaseDAO
{
    constructor(db)
    {
        super(db, "client")
    }

    insert(client)
    {
        return new Promise((resolve, reject) =>
            this.db.query("INSERT INTO client(nom, prenom, displayName, login, dateNaissance, lieuNaissance, rue, cp, ville, challenge, role, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING ID",
                [client.nom, client.prenom, client.displayName, client.login, client.dateNaissance, client.lieuNaissance, client.rue, client.cp, client.ville, client.challenge, client.role, client.active])
                .then(res => resolve(res.rows[0].id) )
                .catch(e => reject(e)))
    }

    getByLogin(login)
    {
        return new Promise((resolve, reject) =>
            this.db.query("SELECT * FROM client WHERE login=$1", [ login ])
                .then(res => resolve(res.rows[0]) )
                .catch(e => reject(e)))
    }
}