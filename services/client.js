const ClientDAO = require("../data/dao/clientDAO")
const Client = require("../data/model/client")
const bcrypt = require('bcrypt')

module.exports = class UserAccountService {
    constructor(db) {
        this.dao = new ClientDAO(db)
    }

    hashPassword(password)
    {
        return bcrypt.hashSync(password, 10)
    }

    isValid(client)
    {
        client.nom = client.nom && client.nom.trim()
        client.prenom = client.prenom && client.prenom.trim()
        client.lieuNaissance = client.lieuNaissance && client.lieuNaissance.trim()
        client.rue = client.rue && client.rue.trim()
        client.ville = client.ville && client.ville.trim()
        if (client.prenom === "" || client.prenom === null) return false
        if (client.nom === "" || client.nom === null) return false
        if (client.lieuNaissance === "" || client.lieuNaissance === null) return false
        if (client.rue === "" || client.rue === null) return false
        if (client.ville === "" || client.ville === null) return false
        if(client.login === null) return false
        if(!client.login.match(new RegExp("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"))) return false
        if(client.dateNaissance == null) return false
        return client.password != null;
    }

    isValidEmail(email) {
        if(email) {
            return email.match(new RegExp("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"))
        }
        return true
    }

    async isLoginValid(login)
    {
        if(login) {
            const client = await this.dao.getByLogin(login.trim())
            return (client === undefined)
        }
        return true
    }

    isPwdValid(password)
    {
        if(password.match(new RegExp("[A-Z]")) &&
            password.match(new RegExp("[a-z]")) &&
            password.match(new RegExp("[0-9]")) &&
            password.match(new RegExp("[`~!:;@#$%^&*]"))) {
            return true
        }
        return false
    }

    insert(nom, prenom, displayName, login, dateNaissance, lieuNaissance, rue, cp, ville, password)
    {
        return this.dao.insert(new Client(nom, prenom, displayName, login, dateNaissance, lieuNaissance, rue, cp, ville, this.hashPassword(password), "CLIENT", true))
    }

    async validatePassword(login, password)
    {
        const client = await this.dao.getByLogin(login.trim())
        if(client === undefined) return false
        return this.comparePassword(password, client.challenge)
    }

    comparePassword(password, hash)
    {
        return bcrypt.compareSync(password, hash)
    }

    async isActive(login)
    {
        const user = await this.dao.getByLogin(login)
        return user.active
    }

    patchClient(client, newClient) {
        if(newClient.nom) client.nom = newClient.nom
        if(newClient.prenom) client.prenom = newClient.prenom
        if(newClient.displayName) client.displayname = newClient.displayName
        if(newClient.login) client.login = newClient.login
        if(newClient.dateNaissance) client.datenaissance = newClient.dateNaissance
        if(newClient.lieuNaissance) client.lieunaissance = newClient.lieuNaissance
        if(newClient.rue) client.rue = newClient.rue
        if(newClient.cp) client.cp = newClient.cp
        if(newClient.ville) client.ville = newClient.ville
    }
}