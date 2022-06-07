const pg = require('pg')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const UserAccountService = require("./services/useraccount")
const RoleService = require("./services/role")

const app = express()
app.use(bodyParser.urlencoded({ extended: false })) // URLEncoded form data
app.use(bodyParser.json()) // application/json
app.use(cors())
app.use(morgan('dev')); // toutes les requêtes HTTP dans le log du serveur

const connectionString = "postgres://user1:default@localhost/template"
const db = new pg.Pool({ connectionString: connectionString })

const dirName = __dirname

const userAccountService = new UserAccountService(db)
const roleService = new RoleService(db)
const jwt = require('./jwt')(userAccountService)

require('./api/useraccount')(app, userAccountService, roleService, dirName, jwt)
require('./api/role')(app, roleService, jwt)
require('./data/seeder')(userAccountService, roleService)
    .then(_ => app.listen(3333))


