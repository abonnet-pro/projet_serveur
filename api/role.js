module.exports = (app, svc, jwt) => {
    app.get("/role/roles/:login", jwt.validateJWT, async (req, res) => {
        try
        {
            const roles = await svc.dao.getRolesByLogin(req.params.login)
            if(roles === undefined)
            {
                res.status(404).end()
            }
            return res.json(roles)
        }
        catch(e)
        {
            res.status(400).end()
        }
    })

    app.post("/role", jwt.validateJWT, async (req, res) => {
        const role = req.body
        console.log(role)
        if(! await svc.isAdmin(req.user.login))
        {
            res.status(401).end()
        }

        svc.dao.insert(role.iduser, role.role)
            .then(res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })

    app.delete("/role/:id", jwt.validateJWT, async (req, res) => {
        try
        {
            const roles = await svc.dao.getRolesByUserId(req.params.id)
            if (roles === undefined)
            {
                return res.status(404).end()
            }

            if(! await svc.isAdmin(req.user.login))
            {
                res.status(401).end()
            }

            svc.dao.deleteRolesByUserId(req.params.id)
                .then(res.status(200).end())
                .catch(e => {
                    console.log(e)
                    res.status(500).end()
                })
        }
        catch(e)
        {
            console.log(e)
            return res.status(400).end()
        }
    })
}