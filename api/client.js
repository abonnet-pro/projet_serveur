module.exports = (app, clientService, abonnementService, paiementService, publicationService, role, dirName, jwt) => {

    app.post('/api/client', async (req, res) => {
        const client = req.body

        if(!clientService.isValid(client)) {
            return res.status(400).send("Informations invalides")
        }

        if(!await clientService.isLoginValid(client.login)) {
            return res.status(400).send("Login déjà utilisé")
        }

        if(!clientService.isLoginAllowed(client.login)) {
            return res.status(400).send("Ce type de login (...@esimed.fr) n'est pas autorisé à l'inscription")
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

    app.post('/api/client/authenticate', (req, res) => {
        const form = req.body

        if ((form.login === undefined) || (form.password === undefined)) {
            return res.status(400).send("Informations invalides")
        }

        clientService.validatePassword(form.login, form.password)
            .then(async authenticated => {
                if(!authenticated) {
                    return res.status(400).send("Couple email / mot de passe invalide")
                }

                if (!await clientService.isActive(form.login)) {
                    return res.status(400).send("Compte suspendu")
                }

                const client = await clientService.dao.getByLogin(form.login)
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
                    token: jwt.generateJWT(form.login)
                }

                res.json(clientDTO)
            })
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })

    app.get('/api/client', jwt.validateJWT, role.employe, async (req, res) => {
        try
        {
            let clients = await clientService.dao.getAll()

            if(clients === undefined) {
                return res.status(404).end()
            }

            return res.json(await clientService.getClientsDTO(clients, abonnementService))
        } catch (e) {
            res.status(400).end()
        }
    })

    app.get('/api/client/:id', jwt.validateJWT, role.employe, async (req, res) => {
        try
        {
            let client = await clientService.dao.getById(req.params.id)

            if(client === undefined) {
                return res.status(404).end()
            }

            return res.json(await clientService.getClientDTO(client, abonnementService, paiementService, publicationService))
        } catch (e) {
            res.status(400).end()
        }
    })

    app.patch('/api/client/:id', jwt.validateJWT, async (req, res) => {
        const client = await clientService.dao.getById(req.params.id)
        if(!client) {
            return res.status(400).send("Impossible de trouver le client")
        }

        if(!clientService.canAccess(req.user, client)) {
            return res.status(401).end()
        }

        if(!clientService.isValidEmail(req.body.login)) {
            return res.status(400).send("Email invalide")
        }

        if(!await clientService.isLoginValid(req.body.login)) {
            return res.status(400).send("Login déjà utilisé")
        }

        clientService.patchClient(client, req.body)
        clientService.dao.update(client)
            .then(() => {
                clientService.dao.getById(client.id)
                    .then(async client => {

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
                            active: client.active,
                            token: jwt.generateJWT(client.login)
                        }

                        res.json(clientDTO)
                    })
                    .catch(e => {
                        console.log(e)
                        res.status(500).end()
                    })
            })
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })

    app.post('/api/client/:id/activer', jwt.validateJWT, role.employe, async (req, res) => {
        const client = await clientService.dao.getById(req.params.id)
        if(!client) {
            return res.status(400).send("Impossible de trouver le client")
        }

        if(client.active) {
            return res.status(400).send("Le compte est déjà activé")
        }

        clientService.dao.active(client.id)
            .then(() => {
                clientService.dao.getById(client.id)
                    .then(async client => {

                        const clientDTO = {
                            id: client.id,
                            nom: client.nom,
                            prenom: client.prenom,
                            displayname: client.displayname,
                            login: client.login,
                            datenaissance: client.datenaissance,
                            lieunaissance: client.lieunaissance,
                            rue: client.rue,
                            cp: client.cp,
                            ville: client.ville,
                            role: client.role,
                            active: client.active
                        }

                        res.json(clientDTO)
                    })
                    .catch(e => {
                        console.log(e)
                        res.status(500).end()
                    })
            })
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })

    app.post('/api/client/:id/desactiver', jwt.validateJWT, role.employe, async (req, res) => {
        const client = await clientService.dao.getById(req.params.id)
        if(!client) {
            return res.status(400).send("Impossible de trouver le client")
        }

        if(!client.active) {
            return res.status(400).send("Le compte est déjà desactivé")
        }

        clientService.dao.desactive(client.id)
            .then(() => {
                clientService.dao.getById(client.id)
                    .then(async client => {

                        const clientDTO = {
                            id: client.id,
                            nom: client.nom,
                            prenom: client.prenom,
                            displayname: client.displayname,
                            login: client.login,
                            datenaissance: client.datenaissance,
                            lieunaissance: client.lieunaissance,
                            rue: client.rue,
                            cp: client.cp,
                            ville: client.ville,
                            role: client.role,
                            active: client.active
                        }

                        res.json(clientDTO)
                    })
                    .catch(e => {
                        console.log(e)
                        res.status(500).end()
                    })
            })
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })
}