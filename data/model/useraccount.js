module.exports = class UserAccount
{
    constructor(displayName, login, challenge, active, confirmation, confirmationDate, reset, resetDate)
    {
        this.id = null
        this.displayName = displayName
        this.login = login
        this.challenge = challenge
        this.active = active
        this.confirmation = confirmation
        this.confirmationDate = confirmationDate
        this.reset = reset
        this.resetDate = resetDate
    }
}