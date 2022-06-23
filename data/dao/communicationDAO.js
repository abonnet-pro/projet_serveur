const BaseDAO = require('./baseDAO')

module.exports = class CommunicationDAO extends BaseDAO {

    constructor(db) {
        super(db, "communication")
    }

    insert(communication) {
        return new Promise((resolve, reject) => {
            this.db.query("INSERT INTO communication(type, clientId, objet, dateEnvoi) VALUES($1, $2, $3, $4) RETURNING ID",
                [communication.type, communication.clientId, communication.objet, communication.dateEnvoi])
                .then(res => resolve(res.rows[0].id))
                .catch(err => reject(err))
        })
    }
}