const pg = require('pg')
const express = require('express')
const https = require('https')
require('https').globalAgent.options.ca = require('ssl-root-cas').create();
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const swaggerUi = require('swagger-ui-express')
const yaml = require('yamljs')
const cron = require('node-cron')
const fs = require('fs')
require('dotenv').config();

const UserAccountService = require("./services/useraccount")
const PublicationService = require("./services/publication")
const ClientService = require("./services/client")
const AbonnementService = require("./services/abonnement")
const PaiementService = require("./services/paiement")
const CommunicationService = require("./services/communication")
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
const communicationService = new CommunicationService(db)

const jwt = require('./utils/jwt')(userAccountService, clientService)
const role = require('./utils/role')()

cron.schedule('0 1 * * * *', async () => abonnementService.checkFinAbonnements())
cron.schedule('* * * 1 * *', async () => abonnementService.envoiAbonnements())

require('./api/useraccount')(app, userAccountService, role, dirName, jwt)
require('./api/publication')(app, publicationService, abonnementService, role, dirName, jwt)
require('./api/client')(app, clientService, abonnementService, paiementService, publicationService, communicationService, role, dirName, jwt)
require('./api/abonnement')(app, abonnementService, publicationService, clientService, paiementService, communicationService, role, dirName, jwt)
require('./api/paiement')(app, paiementService, abonnementService, clientService, communicationService, publicationService, role, dirName, jwt)
require('./data/seeder')(userAccountService, clientService, publicationService, abonnementService, paiementService, communicationService)

https.createServer({
    key: fs.readFileSync('./security/cert.key'),
    cert: fs.readFileSync('./security/cert.pem')
}, app).listen(3332, () => {
    console.log('Listening...')
})