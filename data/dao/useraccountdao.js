const BaseDAO = require('./basedao')

module.exports = class UserAccountDAO extends BaseDAO
{
    constructor(db)
    {
        super(db, "useraccount")
    }

    insert(useraccount)
    {
        return new Promise((resolve, reject) =>
            this.db.query("INSERT INTO useraccount(displayname, login, challenge, role, active) VALUES ($1,$2,$3,$4,$5) RETURNING ID",
            [useraccount.displayName, useraccount.login, useraccount.challenge, useraccount.role, useraccount.active])
                .then(res => resolve(res.rows[0].id) )
                .catch(e => reject(e)))
    }

    getByLogin(login)
    {
        return new Promise((resolve, reject) =>
            this.db.query("SELECT * FROM useraccount WHERE login=$1", [ login ])
                .then(res => resolve(res.rows[0]) )
                .catch(e => reject(e)))
    }

    getLikeLogin(login)
    {
        return new Promise((resolve, reject) => {
            this.db.query("SELECT id, displayname, login FROM useraccount WHERE (login LIKE $1 || '%' OR displayname LIKE $1 || '%')", [login])
                .then(res => resolve(res.rows))
                .catch(err => reject(err))
        })
    }


    update(useraccount)
    {
        return this.db.query("UPDATE useraccount SET displayname=$1, login=$2, challenge=$3, role=$4, active=$5, WHERE id=$6",
            [useraccount.displayname, useraccount.login, useraccount.challenge, useraccount.role, useraccount.active, useraccount.id])
    }

    getAllUsers()
    {
        return new Promise((resolve, reject) => {
            this.db.query("SELECT * FROM useraccount")
                .then(res => resolve(res.rows))
                .catch(err => reject(err))
        })
    }
}