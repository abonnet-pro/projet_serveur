module.exports = class Publication
{
    constructor(titre, nbrNumeroAnnee, photoCourverture, description, prixAnnuel)
    {
        this.id = null
        this.titre = titre
        this.nbrNumeroAnnee = nbrNumeroAnnee
        this.photoCourverture = photoCourverture
        this.description = description
        this.prixAnnuel = prixAnnuel
    }
}