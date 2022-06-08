const PublicationDAO = require('../data/dao/publicationDAO')

module.exports = class PublicationService {

    constructor(db) {
        this.dao = new PublicationDAO(db)
    }
}