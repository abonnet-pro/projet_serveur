const BaseDAO = require('./baseDAO')

module.exports = class UserAccountDAO extends BaseDAO
{
    constructor(db)
    {
        super(db, "publication")
    }

    getAll() {
        return new Promise((resolve, reject) => {
            this.db.query("SELECT * FROM publication")
                .then(res => resolve(res.rows))
                .catch(err => reject(err))
        })
    }

    insert(publication)
    {
        return new Promise((resolve, reject) => {
            this.db.query("INSERT INTO publication(titre, nbrNumeroAnnee, photoCouverture, description, prixAnnuel) VALUES($1, $2, $3, $4, $5) RETURNING ID",
                [publication.titre, publication.nbrNumeroAnnee, publication.photoCouverture, publication.description, publication.prixAnnuel])
                .then(res => resolve(res.rows[0].id))
                .catch(err => reject(err))
        })
    }

    update(publication)
    {
        return this.db.query("UPDATE publication SET titre=$2,description=$3,nbrNumeroAnnee=$4, photoCouverture=$5, prixAnnuel=$6 WHERE id=$1",
            [publication.id, publication.titre, publication.description, publication.nbrnumeroannee, publication.photocouverture, publication.prixannuel])
    }
}