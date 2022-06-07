const RoleDAO = require("../data/dao/roledao")

module.exports = class RoleService
{
    constructor(db)
    {
        this.dao = new RoleDAO(db)
    }

    async isAdmin(login)
    {
        let roles = await this.dao.getRolesByLogin(login)
        for(let role in roles)
        {
            if(roles[role].role === "ADMIN")
            {
                return true
            }
        }

        return false
    }
}