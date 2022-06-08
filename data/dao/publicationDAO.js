const BaseDAO = require('./baseDAO')

module.exports = class UserAccountDAO extends BaseDAO
{
    constructor(db)
    {
        super(db, "publication")
    }
}