const pg = require('pg')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const UserAccountService = require("./services/useraccount")

const app = express()
app.use(bodyParser.urlencoded({ extended: false })) // URLEncoded form data
app.use(bodyParser.json()) // application/json
app.use(cors())
app.use(morgan('dev')); // toutes les requêtes HTTP dans le log du serveur

const connectionString = "postgres://user1:default@localhost/abonnements"
const db = new pg.Pool({ connectionString: connectionString })

const dirName = __dirname

const userAccountService = new UserAccountService(db)
const jwt = require('./jwt')(userAccountService)

require('./api/useraccount')(app, userAccountService, dirName, jwt)
require('./data/seeder')(userAccountService)
    .then(_ => app.listen(3333))


