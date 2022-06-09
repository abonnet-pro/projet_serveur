module.exports = class Publication
{
    constructor(titre, nbrNumeroAnnee, photoCouverture, description, prixAnnuel)
    {
        this.id = null
        this.titre = titre
        this.nbrNumeroAnnee = nbrNumeroAnnee
        this.photoCouverture = photoCouverture
        this.description = description
        this.prixAnnuel = prixAnnuel
    }
}