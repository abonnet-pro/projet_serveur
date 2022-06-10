module.exports = class UserAccount
{
    constructor(nom, prenom, login, challenge, role, active, premiereConnexion)
    {
        this.id = null
        this.nom = nom
        this.prenom = prenom
        this.login = login
        this.challenge = challenge
        this.role = role
        this.active = active
        this.premiereConnexion = premiereConnexion
    }
}