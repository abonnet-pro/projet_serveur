module.exports = () => {
    return {
        employe(req, res, next) {
            if(req.user && req.user.role !== 'EMPLOYE') {
                return res.status(401).end()
            }
            return next()
        },
    }
}