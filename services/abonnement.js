const AbonnementDAO = require("../data/dao/abonnementDAO")
const CommunicationService = require("../services/communication")
const ClientService = require("../services/client")
const PublicationService = require("../services/publication")
const Abonnement = require("../data/model/abonnement")
const Communication = require("../data/model/communication")

module.exports = class AbonnementService {
    constructor(db) {
        this.dao = new AbonnementDAO(db)
        this.communicationService = new CommunicationService(db)
        this.clientService = new ClientService(db)
        this.publicationService = new PublicationService(db)
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

    async checkFinAbonnements() {
        let abonnements = await this.dao.getActive()
        let now = new Date()
        for(let abonnement of abonnements) {
            if(new Date(abonnement.datefin) < now && abonnement.actif || abonnement.dateresiliation !== null && abonnement.dateresiliation < now && abonnement.actif) {
                abonnement.actif = false
                await this.dao.update(abonnement)
            }

            let communications = await this.communicationService.dao.getByClient(abonnement.clientid)
            if(this.monthDiff(new Date(), abonnement.datefin) <= 2 && this.communicationService.canSendFinAbonnement(communications, abonnement)) {
                let client = await this.clientService.dao.getById(abonnement.clientid)
                let publication = await this.publicationService.dao.getById(abonnement.publicationid)
                await this.communicationService.envoyerFinAbonnement(client, publication)
                await this.communicationService.dao.insert(new Communication("EMAIL", client.id, `ALERTE_ABONNEMENT_${abonnement.id}`, new Date()))
            }
        }
    }

    async envoiAbonnements() {
        let abonnements = await this.dao.getActive()
        for(let abonnement of abonnements) {
            let client = this.clientService.dao.getById(abonnement.clientid)
            await this.communicationService.dao.insert(new Communication("COURRIER", client.id, `ENVOI_ABONNEMENT_${abonnement.id}`, new Date()))
        }
    }

    monthDiff(dateFrom, dateTo) {
        return dateTo.getMonth() - dateFrom.getMonth() + (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
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

    getAll(user, actif, paye, client) {
        let where = '';

        if(user.role === "CLIENT" || actif || paye || client) {
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

        if(client !== undefined) {
            where += ' and clientid = ' + client
        }

        return this.dao.getAll(where)
    }
}