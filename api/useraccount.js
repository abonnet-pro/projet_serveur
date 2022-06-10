module.exports = (app, svc, role, dirName, jwt) => {

    app.post('/employe', jwt.validateJWT, role.admin, async (req, res) => {
        const useraccount = req.body

        if(!svc.isValid(useraccount)) {
            return res.status(400).send("Informations invalides")
        }

        if(!await svc.isLoginValid(useraccount.login)) {
            return res.status(400).send("Login déjà utilisé")
        }

        if(!svc.isLoginAllowed(useraccount.login)) {
            return res.status(400).send("Le login ne respecte pas les conditions d'inscriptions des employés (adresse @esimed)")
        }

        if(!svc.isPwdValid(useraccount.password)) {
            return res.status(400).send("Le mot de passe ne respecte pas les consignes de securité")
        }

        svc.insert(useraccount.nom, useraccount.prenom, useraccount.login, useraccount.password)
            .then(res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })

    app.post('/employe/authenticate', (req, res) => {
        const { login, password } = req.body

        if ((login === undefined) || (password === undefined)) {
            return res.status(400).send("Informations invalides")
        }

        svc.validatePassword(login, password)
            .then(async authenticated => {
                if(!authenticated) {
                    return res.status(400).send("Couple email / mot de passe invalide")
                }

                if (!await svc.isActive(login)) {
                    return res.status(400).send("Compte suspendu")
                }

                const user = await svc.dao.getByLogin(login)
                const userDTO = {
                    nom: user.nom,
                    prenom: user.prenom,
                    login: user.login,
                    role: user.role,
                    token: jwt.generateJWT(login)
                }

                res.json(userDTO)
            })
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })

    app.post('/useraccount/token', jwt.validateJWT, async (req, res) => {
        const userId = req.user.id
        if(userId === undefined)
        {
            res.status(400).end()
            return
        }
        try
        {
            const user = await svc.dao.getById(userId)
            if(user === undefined)
            {
                res.status(404).end()
            }
            res.json({'token': jwt.generateJWT(user.login)})
        }
        catch (e) {
            res.status(400).end()
        }
    })

    app.get("/useraccount/mail/:login", async (req, res) => {
        try
        {
            let user = await svc.dao.getByLogin(req.params.login)
            if(user === undefined)
            {
                res.status(404).end()
            }
            if(!user.active)
            {
                user.confirmation = svc.generateLink()
                user.confirmationdate = new Date().toUTCString()

                await svc.dao.update(user)
                    .catch(e => {
                        console.log(e)
                        res.status(500).end()
                    })

                svc.sendConfirmationEmail(user)
                res.status(200).end()
            }
        }
        catch (e)
        {
            console.log(e)
            res.status(400).end()
        }
    })

    app.get("/useraccount/resetPassword/:login", async (req, res) => {
        try
        {
            let user = await svc.dao.getByLogin(req.params.login)
            if(user === undefined)
            {
                res.status(404).end()
            }

            user.reset = svc.generateLink()
            user.resetdate = new Date().toUTCString()

            await svc.dao.update(user)
                .catch(e => {
                    console.log(e)
                    res.status(500).end()
                })

            svc.sendResetPasswordEmail(user)
            res.status(200).end()
        }
        catch (e)
        {
            console.log(e)
            res.status(400).end()
        }
    })

    app.get("/useraccount/confirm/:confirmationCode", async (req, res) => {
        try
        {
            let user = await svc.dao.getByConfirmation(req.params.confirmationCode)
            if(user === undefined)
            {
                res.status(404).end()
            }

            if(svc.getHoursDifference(user.confirmationdate) >= 24 && !user.active)
            {
                res.sendFile(`${dirName}/view/expire.html`)
                return
            }

            user.active = true
            user.confirmation = null
            user.confirmationdate = null
            user.role = "EMPLOYE"

            await svc.dao.update(user)
                .then( res.sendFile(`${dirName}/view/confirmation.html`))
                .catch(e => {
                    console.log(e)
                    res.status(500).end()
                })
        }
        catch (e)
        {
            console.log(e)
            res.status(400).end()
        }
    })

    app.get("/useraccount/share/:login", jwt.validateJWT, async (req, res) => {
        try
        {
            const userList = await svc.dao.getLikeLoginForShare(req.params.login, req.user.id)
            if(userList === undefined)
            {
                res.status(404).end()
            }
            return res.json(userList)
        }
        catch (e)
        {
            console.log(e.toString())
            res.status(400).end()
        }
    })

    app.get("/useraccount/:login", jwt.validateJWT, async (req, res) => {
        try
        {
            const userList = await svc.dao.getLikeLogin(req.params.login)
            if(userList === undefined)
            {
                res.status(404).end()
            }
            return res.json(userList)
        }
        catch (e)
        {
            console.log(e.toString())
            res.status(400).end()
        }
    })

    app.get("/useraccount/login/:login", jwt.validateJWT, async (req, res) => {
        try
        {
            const useraccount = await svc.dao.getByLogin(req.params.login)
            if(useraccount === undefined)
            {
                res.status(404).end()
            }
            return res.json(useraccount)
        }
        catch(e)
        {
            res.status(400).end()
        }
    })

    app.get("/useraccount/id/:id", jwt.validateJWT, async (req, res) => {
        try
        {
            const useraccount = await svc.dao.getById(req.params.id)
            if(useraccount === undefined)
            {
                res.status(404).end()
            }
            return res.json(useraccount)
        }
        catch (e)
        {
            res.status(400).end()
        }
    })

    app.get("/useraccount/resetCode/:code", async (req, res) => {
        try
        {
            const useraccount = await svc.dao.getByResetCode(req.params.code)
            if(useraccount === undefined)
            {
                res.status(404).end()
            }
            return res.json(useraccount)
        }
        catch(e)
        {
            res.status(400).end()
        }
    })

    app.put("/useraccount/reset",  async (req, res) => {
        const user = req.body
        if ((user.id === undefined) || (user.id == null))
        {
            return res.status(400).end()
        }

        svc.update(user)
            .then(res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })

    app.put("/useraccount", jwt.validateJWT, async (req, res) => {
        const user = req.body
        if ((user.id === undefined) || (user.id == null))
        {
            return res.status(400).end()
        }

        svc.update(user)
            .then(res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })

    app.get("/useraccount", jwt.validateJWT, async (req, res) => {
        try
        {
            const users = await svc.dao.getAllUsers()
            if(users === undefined)
            {
                res.status(404).end()
            }

            return res.json(users)
        }
        catch (e) {
            res.status(400).end()
        }
    })
}
