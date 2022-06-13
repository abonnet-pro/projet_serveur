module.exports = class Abonnement
{
    constructor(clientId, publicationId, dateDebut, dateFin, actif, paye, dateResiliation)
    {
        this.id = null
        this.clientId = clientId
        this.publicationId = publicationId
        this.dateDebut = dateDebut
        this.dateFin = dateFin
        this.actif = actif
        this.paye = paye
        this.dateResiliation = dateResiliation
        this.paiementId = null
        this.rembourse = false
    }
}