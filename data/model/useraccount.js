module.exports = class UserAccount
{
    constructor(displayName, login, challenge, role, active)
    {
        this.id = null
        this.displayName = displayName
        this.login = login
        this.challenge = challenge
        this.role = role
        this.active = active
    }
}