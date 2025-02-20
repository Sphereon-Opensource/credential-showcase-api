import 'reflect-metadata';
import { createExpressServer, useContainer } from 'routing-controllers';
import Container from 'typedi';
import { ExpressErrorHandler } from './middleware/ExpressErrorHandler';
import AssetController from './controllers/AssetController';
import CredentialDefinitionController from './controllers/CredentialDefinitionController';
import RelyingPartyController from './controllers/RelyingPartyController';
import IssuerController from './controllers/IssuerController';
import IssuanceFlowController from './controllers/IssuanceFlowController';

require('dotenv-flow').config();

// Ensure routing-controllers uses typedi for DI
useContainer(Container);

const app = createExpressServer({
    controllers: [
        AssetController,
        CredentialDefinitionController,
        RelyingPartyController,
        IssuerController,
        IssuanceFlowController
    ],
    middlewares: [ExpressErrorHandler],
    defaultErrorHandler: false,
});

const port = Number(process.env.PORT)
app.listen(port, (): void => {
    console.log(`Server is running on port ${port}`)
})
