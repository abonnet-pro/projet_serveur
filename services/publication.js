const PublicationDAO = require('../data/dao/publicationDAO')

module.exports = class PublicationService {

    constructor(db) {
        this.dao = new PublicationDAO(db)
    }

    getAll(active, promotion, titre) {
        let where = '';

        if(active || promotion || titre) {
            where += 'WHERE 1=1'
        }

        if(active !== undefined) {
            where += ' and active = ' + active
        }

        if(promotion !== undefined) {
            where += ' and promotion = ' + promotion
        }

        if(titre !== undefined && titre !== '') {
            where += ' and UPPER(titre) like UPPER(\'%' + titre + '%\')'
        }

        return this.dao.getAll(where)
    }

    isValid(publication) {
        publication.titre = publication.titre && publication.titre.trim()
        publication.description = publication.description && publication.description.trim()
        if(publication.titre === null || publication.titre === "" || publication.titre === undefined) return false
        if(publication.description === null || publication.description === "" || publication.description === undefined) return false
        if(publication.nbrNumeroAnnee < 0 || publication.nbrNumeroAnnee === null || publication.nbrNumeroAnnee === undefined) return false
        if(publication.photoCouverture === null || publication.photoCouverture === "" || publication.photoCouverture === undefined) return false
        if(publication.promotion === null || publication.promotion === undefined) return false
        return !(publication.prixAnnuel < 0 || publication.prixAnnuel === null || publication.prixAnnuel === undefined)
    }

    patchPublication(publication, newPublication) {
        if(newPublication.titre) publication.titre = newPublication.titre
        if(newPublication.description) publication.description = newPublication.description
        if(newPublication.nbrNumeroAnnee) publication.nbrnumeroannee = newPublication.nbrNumeroAnnee
        if(newPublication.photoCouverture) publication.photocouverture = newPublication.photoCouverture
        if(newPublication.prixAnnuel) publication.prixannuel = newPublication.prixAnnuel
        if(newPublication.promotion !== undefined) publication.promotion = newPublication.promotion
        if(newPublication.pourcentagePromo) publication.pourcentagepromo = newPublication.pourcentagePromo
        if(newPublication.active !== undefined) publication.active = newPublication.active
    }
}