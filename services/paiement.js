const PaiementDAO = require("../data/dao/paiementDAO")
const Paiement = require("../data/model/paiement")
const axios = require('axios')

const esipayURL = 'http://esipay.esimed.fr'
const uuidSubMyZine = '7e26fefe-ef6a-b825-736c-521c25e58892'

module.exports = class PaiementService {
    constructor(db) {
        this.dao = new PaiementDAO(db)
    }

    isValid(cardInformations) {
        cardInformations.numeroCarte = cardInformations.numeroCarte.trim()
        if(cardInformations.numeroCarte === '' || cardInformations.numeroCarte === null || cardInformations.numeroCarte === undefined) return false
        if(!cardInformations.numeroCarte.match(new RegExp('[0-9]{10}'))) return false
        if(cardInformations.moisCarte === '' || cardInformations.moisCarte === null || cardInformations.moisCarte === undefined) return false
        if(!cardInformations.moisCarte.match(new RegExp('[0-9]{1,2}'))) return false
        if(cardInformations.anneeCarte === '' || cardInformations.anneeCarte === null || cardInformations.anneeCarte === undefined) return false
        if(!cardInformations.anneeCarte.match(new RegExp('[0-9]{4}'))) return false
        return true
    }

    async payerAbonnement(paiement, cardInformations, publication) {
        const amount = publication.pourcentagePromo ? (publication.prixannuel * publication.pourcentagePromo)/100 : publication.prixannuel
        const url = `${esipayURL}/cardpay/${uuidSubMyZine}/${paiement.id}/${cardInformations.numeroCarte}/${cardInformations.moisCarte}/${cardInformations.anneeCarte}/${amount}`
        return axios.get(url)
    }
}