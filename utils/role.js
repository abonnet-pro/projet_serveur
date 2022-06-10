module.exports = () => {
    return {
        employe(req, res, next) {
            if(req.user && req.user.role !== 'EMPLOYE' && req.user.role !== 'ADMIN') {
                return res.status(401).end()
            }
            return next()
        },
        admin(req, res, next) {
            if(req.user && req.user.role !== 'ADMIN') {
                return res.status(401).end()
            }
            return next()
        },
        client(req, res, next) {
            if(req.user && req.user.role !== 'CLIENT') {
                return res.status(401).end()
            }
            return next()
        },
    }
}