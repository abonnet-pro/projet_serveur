const bcrypt = require('bcrypt')
const nodemailer = require("nodemailer")
const UserAccountDAO = require('../data/dao/useraccountDAO')
const UserAccount = require('../data/model/useraccount')

module.exports = class UserAccountService
{
    constructor(db) {
        this.dao = new UserAccountDAO(db)
    }

    isValid(useraccount) {
        useraccount.nom = useraccount.nom && useraccount.nom.trim()
        useraccount.prenom = useraccount.prenom && useraccount.prenom.trim()
        if (useraccount.prenom === "") return false
        if(useraccount.login == null) return false
        return !(useraccount.role === null || useraccount.role === undefined);
    }

    async isLoginValid(login) {
        const user = await this.dao.getByLogin(login.trim())
        return (user === undefined)
    }

    insert(nom, prenom, login, password, role) {
        return this.dao.insert(new UserAccount(nom, prenom, login, this.hashPassword(password), role, true, true))
    }

    isPwdValid(password) {
        if(password.match(new RegExp("[A-Z]")) &&
            password.match(new RegExp("[a-z]")) &&
            password.match(new RegExp("[0-9]")) &&
            password.match(new RegExp("[`~!:;@#$%^&*]"))) {
            return true
        }
        return false
    }

    isLoginAllowed(login) {
        return login.includes("@submyzine.fr")
    }

    async update(user) {
        let prevUser = await this.dao.getById(user.id)

        if(!this.comparePassword(user.challenge, prevUser.challenge) && user.challenge !== prevUser.challenge)
        {
            user.challenge = this.hashPassword(user.challenge)
        }
        else {
            user.challenge = prevUser.challenge
        }

        return this.dao.update(user)
    }

    async validatePassword(login, password)
    {
        const user = await this.dao.getByLogin(login.trim())
        if(user === undefined) return false
        return this.comparePassword(password, user.challenge)
    }

    async isActive(login)
    {
        const user = await this.dao.getByLogin(login)
        return user.active
    }

    comparePassword(password, hash)
    {
        return bcrypt.compareSync(password, hash)
    }

    hashPassword(password)
    {
        return bcrypt.hashSync(password, 10)  // 10 : cost factor -> + élevé = hash + sûr
    }

}