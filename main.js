const pg = require('pg')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const swaggerUi = require('swagger-ui-express')
const yaml = require('yamljs')
require('dotenv').config();

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
app.use('/api/images', express.static('asset/images'));

const connectionString = process.env.CONNECTION_STRING
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
require('./api/client')(app, clientService, abonnementService, paiementService, role, dirName, jwt)
require('./api/abonnement')(app, abonnementService, publicationService, clientService, paiementService, dirName, jwt)
require('./api/paiement')(app, paiementService, abonnementService, dirName, jwt)
require('./data/seeder')(userAccountService, clientService, publicationService, abonnementService, paiementService)
    .then(_ => app.listen(3332))