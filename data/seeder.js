const UserAccount = require('./model/useraccount')

module.exports = (userAccountService, roleService) => {
    return new Promise(async (resolve, reject) => {
        try {
            await userAccountService.dao.db.query("CREATE TABLE useraccount(id SERIAL PRIMARY KEY, displayname TEXT NOT NULL, login TEXT NOT NULL, challenge TEXT NOT NULL, active BOOLEAN NOT NULL, confirmation TEXT, confirmationdate TIMESTAMPTZ, reset TEXT, resetdate TIMESTAMPTZ)")
            await roleService.dao.db.query("CREATE TABLE role(id SERIAL PRIMARY KEY, iduser INTEGER NOT NULL, role TEXT NOT NULL, FOREIGN KEY(iduser) REFERENCES useraccount(id) ON DELETE CASCADE)")

            const idUser = await userAccountService.dao.insert(new UserAccount("User1", "anthony.bonnet1@orange.fr", userAccountService.hashPassword("1401"), true, null, null))
            const idRole1 = await roleService.dao.insert(idUser, "ADMIN")
            const idRole2 = await roleService.dao.insert(idUser, "USER")

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