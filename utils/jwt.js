const jwt = require('jsonwebtoken')
const jwtKey = 'exemple_cours_secret_key'
const jwtExpirySeconds = 86400

module.exports = (userAccountService, clientService) => {
    return {
        validateJWT(req, res, next) {
            if (req.headers.authorization === undefined) {
                res.status(401).end()
                return
            }
            const token = req.headers.authorization.split(" ")[1];
            jwt.verify(token, jwtKey, {algorithm: "HS256"},  async (err, user) => {
                if (err) {
                    res.status(401).end()
                    return
                }
                try {
                    req.user = await userAccountService.dao.getByLogin(user.login)
                    if(!req.user) {
                        req.user = await clientService.dao.getByLogin(user.login)
                    }

                    return next()
                } catch(e) {
                    console.log(e)
                    res.status(401).end()
                }
            })
        },
        generateJWT(login) {
            return jwt.sign({login}, jwtKey, {
                algorithm: 'HS256',
                expiresIn: jwtExpirySeconds
            })
        }
    }
}
