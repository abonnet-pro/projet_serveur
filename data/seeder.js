const UserAccount = require('./model/useraccount')
const Client = require('./model/client')

module.exports = (userAccountService, clientService, publicationService) => {
    return new Promise(async (resolve, reject) => {
        try {
            await userAccountService.dao.db.query("CREATE TABLE useraccount(id SERIAL PRIMARY KEY, nom TEXT NOT NULL, prenom TEXT NOT NULL, login TEXT NOT NULL, challenge TEXT NOT NULL, role TEXT NOT NULL, active BOOLEAN NOT NULL)")
            await clientService.dao.db.query("CREATE TABLE client(id SERIAL PRIMARY KEY, nom TEXT NOT NULL, prenom TEXT NOT NULL, displayName TEXT NOT NULL, login TEXT NOT NULL, dateNaissance DATE NOT NULL, lieuNaissance TEXT NOT NULL, rue TEXT NOT NULL, cp TEXT NOT NULL, ville TEXT NOT NULL, challenge TEXT NOT NULL, role TEXT NOT NULL, active BOOLEAN NOT NULL)")
            await publicationService.dao.db.query("CREATE TABLE publication(id SERIAL PRIMARY KEY, titre TEXT NOT NULL, nbrNumeroAnnee SMALLINT NOT NULL, photoCouverture TEXT NOT NULL, description TEXT NOT NULL, prixAnnuel REAL NOT NULL)")

            await userAccountService.dao.insert(new UserAccount("Anthony", "Bonnet", "abonnet@esimed.fr", userAccountService.hashPassword("1401"), "EMPLOYE",true))
            await clientService.dao.insert(new Client("Anthony", "Bonnet", "Tony", "anthony.bonnet1@orange.fr", "14/01/1993", "Saint-Etienne", "2 rue rascas", "84000", "Avignon", userAccountService.hashPassword("1401"), "CLIENT", true))

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