const BaseDAO = require('./baseDAO')

module.exports = class UserAccountDAO extends BaseDAO
{
    constructor(db)
    {
        super(db, "publication")
    }

    getAll(where) {
        return new Promise((resolve, reject) => {
            this.db.query("SELECT * FROM publication " + where)
                .then(res => resolve(res.rows))
                .catch(err => reject(err))
        })
    }

    insert(publication)
    {
        return new Promise((resolve, reject) => {
            this.db.query("INSERT INTO publication(titre, nbrNumeroAnnee, photoCouverture, description, prixAnnuel, promotion, pourcentagePromo) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING ID",
                [publication.titre, publication.nbrNumeroAnnee, publication.photoCouverture, publication.description, publication.prixAnnuel, publication.promotion, publication.pourcentagePromo])
                .then(res => resolve(res.rows[0].id))
                .catch(err => reject(err))
        })
    }

    update(publication)
    {
        return this.db.query("UPDATE publication SET titre=$2,description=$3,nbrNumeroAnnee=$4, photoCouverture=$5, prixAnnuel=$6, promotion=$7, pourcentagePromo=$8 WHERE id=$1",
            [publication.id, publication.titre, publication.description, publication.nbrnumeroannee, publication.photocouverture, publication.prixannuel, publication.promotion, publication.pourcentagepromo])
    }
}