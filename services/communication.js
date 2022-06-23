const CommunicationDAO = require('../data/dao/communicationDAO')
const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_MAILER_USER,
        pass: process.env.AUTH_MAILER_PASS
    }
})

module.exports = class CommunicationService {

    constructor(db) {
        this.dao = new CommunicationDAO(db)
    }

    envoyerMailInscription(client) {
        return transport.sendMail({
            from: process.env.AUTH_MAILER_USER,
            to: client.login,
            subject: "Inscription à SubMyZine",
            html: `<h1>Bienvenue !</h1>
                   <h2>Bonjour ${client.displayName}</h2>
                   <p>Nous vous remercions de l'intérêt que vous portez à SubMyZine.</p>
                   <p>Toute l'équipe vous souhaite la bienvenue !</p>
                   <p>Nous vous conseillons de vite aller voir nos offre d'abonnements.</p> 
                   <p>Nous restons à votre disposition pour toute question de votre part.</p>
                   <p>Cordialement,</p>
                   <p>L'équipe SubMyZine</p>`
        })
    }

    envoyerMailRelance(client, abonnement, publication) {
        return transport.sendMail({
            from: process.env.AUTH_MAILER_USER,
            to: client.login,
            subject: "Votre abonnement à " + publication.titre,
            html: `<h1>Email de relance</h1>
                   <h2>Bonjour ${client.displayname}</h2>
                   <p>Nous vous remercions de l'intérêt que vous portez à SubMyZine. Nous avons détecté un nouvel abonnement de votre part à ${publication.titre}.</p>
                   <p>Cet abonnement n'a toujours pas été réglé et ne peut donc être activé.</p>
                   <p>Nous vous invitons à régulariser le montant sur votre profil afin de profiter pleinement de tous les avantages.</p> 
                   <p>Nous restons à votre disposition pour toute question de votre part.</p>
                   <p>Cordialement,</p>
                   <p>L'équipe SubMyZine</p>`
        })
    }

    envoyerMailPaiement(client, abonnement, paiement, publication) {
        return transport.sendMail({
            from: process.env.AUTH_MAILER_USER,
            to: client.login,
            subject: "Votre abonnement à " + publication.titre,
            html: `<h1>Confirmation d'abonnement</h1>
                   <h2>Bonjour ${client.displayname}</h2>
                   <p>Nous vous remercions de l'intérêt que vous portez à SubMyZine.</p>
                   <p>Votre paiement de ${paiement.montantpaye} € a bien été reçu.</p>
                   <p>Nous vous confirmons votre abonnement à ${publication.titre} jusqu'au ${new Date(abonnement.datefin).toLocaleDateString()}.</p>
                   <p>Vous recevrez très prochainement votre magazine.</p>
                   <p>Nous restons à votre disposition pour toute question de votre part.</p>
                   <p>Cordialement,</p>
                   <p>L'équipe SubMyZine</p>`
        })
    }
}