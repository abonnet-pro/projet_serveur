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

    async getAbonnementsDTO(abonnements, publicationService, clientService) {
        let retour = []

        for(let abonnement of abonnements) {
            const publication = await publicationService.dao.getById(abonnement.publicationid)
            const client = await clientService.dao.getById(abonnement.clientid)

            Reflect.deleteProperty(abonnement, "clientid")
            Reflect.deleteProperty(abonnement, "publicationid")
            Reflect.deleteProperty(client, "challenge")

            retour.push({
                ...abonnement,
                client: client,
                publication: publication
            })
        }

        return retour;
    }

    getAll(user, actif, paye) {
        let where = '';

        if(user.role === "CLIENT" || actif || paye) {
            where += 'WHERE'
        }

        if(user.role === "CLIENT") {
            where += ' clientid = ' + user.id
        }

        if(actif !== undefined) {
            if(where === 'WHERE') {
                where += ' actif = ' + actif
            } else {
                where += ' and actif = ' + actif
            }
        }

        if(paye !== undefined) {
            if(where === 'WHERE') {
                where += ' paye = ' + paye
            } else {
                where += ' and paye = ' + paye
            }
        }

        return this.dao.getAll(where)
    }
}