module.exports = (app, clientService, dirName, jwt) => {

    app.post('/client', async (req, res) => {
        const client = req.body

        if(!clientService.isValid(client))
        {
            return res.status(400).send("Informations invalides")
        }

        if(!await clientService.isLoginValid(client.login))
        {
            return res.status(400).send("Login déjà utilisé")
        }

        if(!clientService.isPwdValid(client.password))
        {
            return res.status(400).send("Le mot de passe ne respecte pas les consignes de securité")
        }

        clientService.insert(client.nom, client.prenom, client.displayName, client.login, client.dateNaissance, client.lieuNaissance, client.rue, client.cp, client.ville, client.password)
            .then(res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })

    app.post('/client/authenticate', (req, res) => {
        const { login, password } = req.body

        if ((login === undefined) || (password === undefined)) {
            return res.status(400).send("Informations invalides")
        }

        clientService.validatePassword(login, password)
            .then(async authenticated => {
                if(!authenticated) {
                    return res.status(400).send("Couple email / mot de passe invalide")
                }

                if (!await clientService.isActive(login)) {
                    return res.status(400).send("Compte suspendu")
                }

                const client = await clientService.dao.getByLogin(login)
                const clientDTO = {
                    id: client.id,
                    nom: client.nom,
                    prenom: client.prenom,
                    displayName: client.displayname,
                    login: client.login,
                    dateNaissance: client.datenaissance,
                    lieuNaissance: client.lieunaissance,
                    rue: client.rue,
                    cp: client.cp,
                    ville: client.ville,
                    role: client.role,
                    token: jwt.generateJWT(login)
                }

                res.json(clientDTO)
            })
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })
}