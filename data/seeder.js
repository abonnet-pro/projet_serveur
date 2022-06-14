const UserAccount = require('./model/useraccount')
const Client = require('./model/client')
const Publication = require('./model/publication')

module.exports = (userAccountService, clientService, publicationService, abonnementService, paiementService) => {
    return new Promise(async (resolve, reject) => {
        try {
            await userAccountService.dao.db.query("CREATE TABLE useraccount(id SERIAL PRIMARY KEY, nom TEXT NOT NULL, prenom TEXT NOT NULL, login TEXT NOT NULL, challenge TEXT NOT NULL, role TEXT NOT NULL, active BOOLEAN NOT NULL, premiereConnexion BOOLEAN NOT NULL DEFAULT TRUE)")
            await clientService.dao.db.query("CREATE TABLE client(id SERIAL PRIMARY KEY, nom TEXT NOT NULL, prenom TEXT NOT NULL, displayName TEXT NOT NULL, login TEXT NOT NULL, dateNaissance DATE NOT NULL, lieuNaissance TEXT NOT NULL, rue TEXT NOT NULL, cp TEXT NOT NULL, ville TEXT NOT NULL, challenge TEXT NOT NULL, role TEXT NOT NULL, active BOOLEAN NOT NULL)")
            await publicationService.dao.db.query("CREATE TABLE publication(id SERIAL PRIMARY KEY, titre TEXT NOT NULL, nbrNumeroAnnee SMALLINT NOT NULL, photoCouverture TEXT NOT NULL, description TEXT NOT NULL, prixAnnuel REAL NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE, promotion BOOLEAN NOT NULL DEFAULT FALSE, pourcentagePromo SMALLINT)")
            await abonnementService.dao.db.query("CREATE TABLE abonnement(id SERIAL PRIMARY KEY, clientId INTEGER NOT NULL, publicationId INTEGER NOT NULL, dateDebut DATE, dateFin DATE, actif BOOLEAN NOT NULL, paye BOOLEAN NOT NULL, dateResiliation DATE, rembourse BOOLEAN NOT NULL, FOREIGN KEY(clientId) REFERENCES client(id), FOREIGN KEY(publicationId) REFERENCES publication(id))")
            await paiementService.dao.db.query("CREATE TABLE paiement(id SERIAL PRIMARY KEY, abonnementId INTEGER, type TEXT, montantPaye REAL, transactionId TEXT, montantRembourse REAL, FOREIGN KEY(abonnementId) REFERENCES abonnement(id))")

            await userAccountService.dao.insert(new UserAccount("Employe 1", "EMPLOYE", "employe1@esimed.fr", userAccountService.hashPassword("employe"), "EMPLOYE", true, true))
            await userAccountService.dao.insert(new UserAccount("Admin", "ADMIN", "admin@esimed.fr", userAccountService.hashPassword("admin"), "ADMIN", true, false))

            await clientService.dao.insert(new Client("Client 1", "Client", "Client", "client1@client.fr", "14/01/1993", "Saint-Etienne", "2 rue rascas", "84000", "Avignon", userAccountService.hashPassword("client"), "CLIENT", true))
            await clientService.dao.insert(new Client("Client 2", "Client", "Client", "client2@client.fr", "14/01/1993", "Saint-Etienne", "2 rue rascas", "84000", "Avignon", userAccountService.hashPassword("client"), "CLIENT", true))

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