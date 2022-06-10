const AbonnementDAO = require("../data/dao/abonnementDAO")
const Abonnement = require("../data/model/abonnement")

module.exports = class AbonnementService {
    constructor(db) {
        this.dao = new AbonnementDAO(db)
    }

    newAbonnement(publication, client) {
        let abonnement = new Abonnement(client.id, publication.id, null, null, false, false, null, null, null)
        return this.dao.insert(abonnement)
    }

    getAbonnementDTO(abonnement, publication, client) {
        Reflect.deleteProperty(client, "challenge")
        Reflect.deleteProperty(abonnement, "clientid")
        Reflect.deleteProperty(abonnement, "publicationid")

        return {
            ...abonnement,
            client: client,
            publication: publication,
        }
    }
}