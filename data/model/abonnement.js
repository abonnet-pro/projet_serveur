module.exports = class Abonnement
{
    constructor(clientId, publicationId, dateDebut, dateFin, actif, paye, montantPaye, dateResiliation, montantRembourse)
    {
        this.id = null
        this.clientId = clientId
        this.publicationId = publicationId
        this.dateDebut = dateDebut
        this.dateFin = dateFin
        this.actif = actif
        this.paye = paye
        this.montantPaye = montantPaye
        this.dateResiliation = dateResiliation
        this.montantRembourse = montantRembourse
    }
}