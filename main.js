const pg = require('pg')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const swaggerUi = require('swagger-ui-express')
const yaml = require('yamljs')

const UserAccountService = require("./services/useraccount")
const PublicationService = require("./services/publication")
const ClientService = require("./services/client")
const AbonnementService = require("./services/abonnement")
const PaiementService = require("./services/paiement")
const swaggerDocument = yaml.load('./swagger.yaml');

const app = express()
app.use(bodyParser.urlencoded({ extended: false })) // URLEncoded form data
app.use(bodyParser.json()) // application/json
app.use(cors())
app.use(morgan('dev')); // toutes les requêtes HTTP dans le log du serveur
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.static('asset/images'));

const connectionString = "postgres://user1:default@localhost/abonnements"
const db = new pg.Pool({ connectionString: connectionString })

const dirName = __dirname

const userAccountService = new UserAccountService(db)
const publicationService = new PublicationService(db)
const clientService = new ClientService(db)
const abonnementService = new AbonnementService(db)
const paiementService = new PaiementService(db)

const jwt = require('./utils/jwt')(userAccountService, clientService)
const role = require('./utils/role')()

require('./api/useraccount')(app, userAccountService, role, dirName, jwt)
require('./api/publication')(app, publicationService, abonnementService, role, dirName, jwt)
require('./api/client')(app, clientService, dirName, jwt)
require('./api/abonnement')(app, abonnementService, publicationService, clientService, dirName, jwt)
require('./api/paiement')(app, paiementService, dirName, jwt)
require('./data/seeder')(userAccountService, clientService, publicationService, abonnementService, paiementService)
    .then(_ => app.listen(3332))