const AbonnementDAO = require("../data/dao/abonnementDAO")
const Abonnement = require("../data/model/abonnement")

module.exports = class AbonnementService {
    constructor(db) {
        this.dao = new AbonnementDAO(db)
    }

    newAbonnement(publication, client) {
        let debutAbonnement = new Date();
        let finAbonnement = new Date(debutAbonnement.getFullYear() + 1, debutAbonnement.getMonth(), debutAbonnement.getDate())
        let abonnement = new Abonnement(client.id, publication.id, debutAbonnement, finAbonnement, false, false, null)
        return this.dao.insert(abonnement)
    }

    arreterAbonnement(abonnement) {
        abonnement.actif = false;
        abonnement.dateresiliation = new Date();

        return this.dao.update(abonnement)
    }

    relancerAbonnement(abonnement) {
        let debutAbonnement = abonnement.datefin;
        let finAbonnement = new Date(debutAbonnement.getFullYear() + 1, debutAbonnement.getMonth(), debutAbonnement.getDate())
        let abonnementRelance = new Abonnement(abonnement.clientid, abonnement.publicationid, debutAbonnement, finAbonnement, false, false, null)
        return this.dao.insert(abonnementRelance)
    }

    async checkFinAbonnements(abonnements) {
        let now = new Date()
        for(let abonnement of abonnements) {
            if(abonnement.datefin < now && abonnement.actif || abonnement.dateresiliation < now && abonnement.actif) {
                abonnement.actif = false
            }
            await this.dao.update(abonnement)
        }
    }

    getAbonnementDTO(abonnement, publication, client) {
        Reflect.deleteProperty(client, "challenge")
        Reflect.deleteProperty(abonnement, "clientid")
        Reflect.deleteProperty(abonnement, "publicationid")
        Reflect.deleteProperty(abonnement, "paiementid")

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
            Reflect.deleteProperty(abonnement, "paiementid")
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
            where += 'WHERE 1=1'
        }

        if(user.role === "CLIENT") {
            where += ' and clientid = ' + user.id
        }

        if(actif !== undefined) {
            where += ' and actif = ' + actif
        }

        if(paye !== undefined) {
            where += ' and paye = ' + paye
        }

        return this.dao.getAll(where)
    }
}