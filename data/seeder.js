const UserAccount = require('./model/useraccount')
const Client = require('./model/client')
const Publication = require('./model/publication')

module.exports = (userAccountService, clientService, publicationService, abonnementService) => {
    return new Promise(async (resolve, reject) => {
        try {
            await userAccountService.dao.db.query("CREATE TABLE useraccount(id SERIAL PRIMARY KEY, nom TEXT NOT NULL, prenom TEXT NOT NULL, login TEXT NOT NULL, challenge TEXT NOT NULL, role TEXT NOT NULL, active BOOLEAN NOT NULL)")
            await clientService.dao.db.query("CREATE TABLE client(id SERIAL PRIMARY KEY, nom TEXT NOT NULL, prenom TEXT NOT NULL, displayName TEXT NOT NULL, login TEXT NOT NULL, dateNaissance DATE NOT NULL, lieuNaissance TEXT NOT NULL, rue TEXT NOT NULL, cp TEXT NOT NULL, ville TEXT NOT NULL, challenge TEXT NOT NULL, role TEXT NOT NULL, active BOOLEAN NOT NULL)")
            await publicationService.dao.db.query("CREATE TABLE publication(id SERIAL PRIMARY KEY, titre TEXT NOT NULL, nbrNumeroAnnee SMALLINT NOT NULL, photoCouverture TEXT NOT NULL, description TEXT NOT NULL, prixAnnuel REAL NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE, promotion BOOLEAN NOT NULL DEFAULT FALSE, pourcentagePromo SMALLINT)")
            await abonnementService.dao.db.query("CREATE TABLE abonnement(id SERIAL PRIMARY KEY, clientId INTEGER NOT NULL, publicationId INTEGER NOT NULL, dateDebut DATE, dateFin DATE, actif BOOLEAN NOT NULL, paye BOOLEAN NOT NULL, montantPaye REAL, dateResiliation DATE, montantRembourse REAL, FOREIGN KEY(clientId) REFERENCES client(id), FOREIGN KEY(publicationId) REFERENCES publication(id))")

            await userAccountService.dao.insert(new UserAccount("Anthony", "Bonnet", "abonnet@esimed.fr", userAccountService.hashPassword("1401"), "EMPLOYE",true))
            await clientService.dao.insert(new Client("Anthony", "Bonnet", "Tony", "anthony.bonnet1@orange.fr", "14/01/1993", "Saint-Etienne", "2 rue rascas", "84000", "Avignon", userAccountService.hashPassword("1401"), "CLIENT", true))
            await publicationService.dao.insert(new Publication("France Promo", 12, "fe986c39ebe69725d4493c9f269994ed.png", "France football magazine", 99.99, true, 50))
            await publicationService.dao.insert(new Publication("Chicken", 12, "562089e4f4a84248783dd23a19b89d6f.png", "Chicken magazine", 54.99, false, null))

            resolve()
        }
        catch (e)
        {
            if (e.code === "42P07")
            {
                resolve()
            }
            else
            {
                reject(e)
            }
        }
    })
}