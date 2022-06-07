const BaseDAO = require('./basedao')

module.exports = class RoleDAO extends BaseDAO
{
    constructor(db)
    {
        super(db, "role")
    }

    insert(iduser, role)
    {
        return new Promise((resolve, reject) =>
            this.db.query("INSERT INTO role(iduser, role) VALUES ($1,$2) RETURNING ID",
                [iduser, role])
                .then(res => resolve(res.rows[0].id) )
                .catch(e => reject(e)))
    }

    getRolesByLogin(login)
    {
        return new Promise((resolve, reject) => {
            this.db.query("SELECT role.* FROM role INNER JOIN useraccount ON role.iduser = useraccount.id WHERE useraccount.login = $1", [login])
                .then(res => resolve(res.rows))
                .catch(err => reject(err))
        })
    }

    getRole(role)
    {
        return new Promise((resolve, reject) => {
            this.db.query("SELECT * FROM role WHERE role.iduser = $1 AND role.role = $2", [role.iduser, role.role])
                .then(res => resolve(res.rows))
                .catch(err => reject(err))
        })
    }

    getRolesByUserId(id)
    {
        return new Promise((resolve, reject) => {
            this.db.query("SELECT * FROM role WHERE role.iduser = $1", [id])
                .then(res => resolve(res.rows))
                .catch(err => reject(err))
        })
    }

    deleteRolesByUserId(id)
    {
        return this.db.query(`DELETE FROM role WHERE iduser=$1`, [id])
    }
}