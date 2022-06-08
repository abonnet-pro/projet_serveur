module.exports = class Client
{
    constructor(nom, prenom, displayName, login, dateNaissance, lieuNaissance, rue, cp, ville, challenge, role, active)
    {
        this.id = null
        this.nom = nom
        this.prenom = prenom
        this.displayName = displayName
        this.login = login
        this.dateNaissance = dateNaissance
        this.lieuNaissance = lieuNaissance
        this.rue = rue
        this.cp = cp
        this.ville = ville
        this.challenge = challenge
        this.role = role
        this.active = active
    }
}