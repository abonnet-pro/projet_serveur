const generator = require('generate-password')

module.exports = (app, svc, role, dirName, jwt) => {

    app.post('/api/employe', jwt.validateJWT, role.admin, async (req, res) => {
        const useraccount = req.body

        if(!svc.isValid(useraccount)) {
            return res.status(400).send("Informations invalides")
        }

        if(!await svc.isLoginValid(useraccount.login)) {
            return res.status(400).send("Login déjà utilisé")
        }

        if(!svc.isLoginAllowed(useraccount.login)) {
            return res.status(400).send("Le login ne respecte pas les conditions d'inscriptions des employés (adresse ...@submyzine.fr)")
        }

        useraccount.password = generator.generate({
            length: 16,
            numbers: true,
            symbols: true,
            lowercase: true,
            uppercase: true
        })

        svc.insert(useraccount.nom, useraccount.prenom, useraccount.login, useraccount.password, useraccount.role)
            .then(id => {
                res.json({
                    id: id,
                    nom: useraccount.nom,
                    prenom: useraccount.prenom,
                    login: useraccount.login,
                    role: useraccount.role,
                    password: useraccount.password
                })
            })
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })

    app.post('/api/employe/authenticate', (req, res) => {
        const form = req.body

        if ((form.login === undefined) || (form.password === undefined)) {
            return res.status(400).send("Informations invalides")
        }

        svc.validatePassword(form.login, form.password)
            .then(async authenticated => {
                if(!authenticated) {
                    return res.status(400).send("Couple email / mot de passe invalide")
                }

                if (!await svc.isActive(form.login)) {
                    return res.status(400).send("Compte suspendu")
                }

                const user = await svc.dao.getByLogin(form.login)
                const userDTO = {
                    id: user.id,
                    nom: user.nom,
                    prenom: user.prenom,
                    login: user.login,
                    role: user.role,
                    premiereConnexion: user.premiereconnexion,
                    token: jwt.generateJWT(form.login)
                }

                res.json(userDTO)
            })
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })

    app.get("/api/employe", jwt.validateJWT, role.admin, async (req, res) => {
        try
        {
            const employes = await svc.dao.getAllUsers()
            if(employes === undefined) {
                res.status(404).end()
            }

            return res.json(employes)
        }
        catch (e) {
            res.status(400).end()
        }
    })

    app.get("/api/employe/:id", jwt.validateJWT, role.admin, async (req, res) => {
        try
        {
            const employe = await svc.dao.getById(req.params.id)
            if(employe === undefined) {
                res.status(404).end()
            }

            let employeDTO = {
                id: employe.id,
                nom: employe.nom,
                prenom: employe.prenom,
                login: employe.login,
                role: employe.role,
                active: employe.active,
            }

            return res.json(employeDTO)
        }
        catch (e) {
            res.status(400).end()
        }
    })

    app.post("/api/employe/:id/init", jwt.validateJWT, role.employe, async (req, res) => {
        try
        {
            const employe = await svc.dao.getById(req.params.id)
            if(employe === undefined) {
                return res.status(400).end()
            }

            if(employe.role === 'SUPERADMIN') {
                return res.status(400).end()
            }

            const { password } = req.body
            if(!svc.isPwdValid(password)) {
                return res.status(400).send("Le mot de passe ne respecte pas les consignes de sécurité")
            }

            employe.challenge = password
            employe.premiereconnexion = false

            const employeDTO = {
                id: employe.id,
                nom: employe.nom,
                prenom: employe.prenom,
                login: employe.login,
                role: employe.role,
                premiereConnexion: employe.premiereconnexion,
                token: jwt.generateJWT(employe.login)
            }

            svc.update(employe)
                .then(_ => res.json(employeDTO))
                .catch(e => {
                    console.log(e)
                    res.status(500).end()
                })
        }
        catch (e) {
            res.status(400).end()
        }
    })

    app.post("/api/employe/:id/reset", jwt.validateJWT, role.admin, async (req, res) => {
        try
        {
            const employe = await svc.dao.getById(req.params.id)
            if(employe === undefined) {
                res.status(404).end()
            }

            if(employe.role === 'SUPERADMIN') {
                return res.status(400).end()
            }

            const passwordGenerate = generator.generate({
                length: 16,
                numbers: true,
                symbols: true,
                lowercase: true,
                uppercase: true
            })

            employe.challenge = passwordGenerate
            employe.premiereconnexion = true

            svc.update(employe)
                .then(_ => res.json({ password: passwordGenerate }))
                .catch(e => {
                    console.log(e)
                    res.status(500).end()
                })
        }
        catch (e) {
            res.status(400).end()
        }
    })

    app.post('/api/employe/:id/activer', jwt.validateJWT, role.admin, async (req, res) => {
        const employe = await svc.dao.getById(req.params.id)
        if(!employe) {
            return res.status(400).send("Impossible de trouver le client")
        }

        if(employe.active) {
            return res.status(400).send("Le compte est déjà activé")
        }

        if(employe.role === 'SUPERADMIN') {
            return res.status(400).end()
        }

        svc.dao.active(employe.id)
            .then(() => {
                svc.dao.getById(employe.id)
                    .then(async employe => {

                        const employeDTO = {
                            id: employe.id,
                            nom: employe.nom,
                            prenom: employe.prenom,
                            login: employe.login,
                            role: employe.role,
                            active: employe.active,
                        }

                        res.json(employeDTO)
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

    app.post('/api/employe/:id/desactiver', jwt.validateJWT, role.admin, async (req, res) => {
        const employe = await svc.dao.getById(req.params.id)
        if(!employe) {
            return res.status(400).send("Impossible de trouver le client")
        }

        if(!employe.active) {
            return res.status(400).send("Le compte est déjà désactivé")
        }

        if(employe.role === 'SUPERADMIN') {
            return res.status(400).end()
        }

        svc.dao.desactive(employe.id)
            .then(() => {
                svc.dao.getById(employe.id)
                    .then(async employe => {

                        const employeDTO = {
                            id: employe.id,
                            nom: employe.nom,
                            prenom: employe.prenom,
                            login: employe.login,
                            role: employe.role,
                            active: employe.active,
                        }

                        res.json(employeDTO)
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

    app.delete("/api/employe/:id", jwt.validateJWT, role.admin, async (req, res) => {
        try
        {
            const employe = await svc.dao.getById(req.params.id)
            if (employe === undefined) {
                return res.status(400).send("Impossible de trouver l'employé")
            }

            if(employe.role === 'SUPERADMIN') {
                return res.status(400).end()
            }

            svc.dao.delete(req.params.id)
                .then(res.status(200).end())
                .catch(e => {
                    console.log(e)
                    res.status(500).end()
                })
        } catch(e) {
            console.log(e)
            return res.status(400).end()
        }
    })

    app.patch('/api/employe/:id', jwt.validateJWT, role.admin, async (req, res) => {
        const employe = await svc.dao.getById(req.params.id)
        if(employe === undefined) {
            return res.status(400).send("Impossible de trouver l'employé")
        }

        if(employe.role === 'SUPERADMIN') {
            return res.status(400).end()
        }

        const form = req.body

        if(!svc.isValid(form)) {
            return res.status(400).send("Informations invalides")
        }

        employe.nom = form.nom
        employe.prenom = form.prenom
        employe.role = form.role

        svc.update(employe)
            .then(() => {
                svc.dao.getById(employe.id)
                    .then(_ => {
                        const employeDTO = {
                            id: employe.id,
                            nom: employe.nom,
                            prenom: employe.prenom,
                            login: employe.login,
                            role: employe.role,
                            active: employe.active,
                        }
                        res.json(employeDTO)
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
