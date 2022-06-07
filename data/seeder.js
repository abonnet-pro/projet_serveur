const UserAccount = require('./model/useraccount')

module.exports = (userAccountService) => {
    return new Promise(async (resolve, reject) => {
        try {
            await userAccountService.dao.db.query("CREATE TABLE useraccount(id SERIAL PRIMARY KEY, displayname TEXT NOT NULL, login TEXT NOT NULL, challenge TEXT NOT NULL, role TEXT NOT NULL, active BOOLEAN NOT NULL)")

            const idUser = await userAccountService.dao.insert(new UserAccount("User1", "anthony.bonnet1@orange.fr", userAccountService.hashPassword("1401"), "EMPLOYE",true))

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