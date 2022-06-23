module.exports = class Communication {
    constructor(type, clientId, objet, date) {
        this.id = null
        this.type = type
        this.clientId = clientId
        this.objet = objet
        this.date = date
    }
}