import 'reflect-metadata';
import { createExpressServer, useContainer } from 'routing-controllers';
import Container from 'typedi';
import AssetController from './controllers/AssetController';
import { ExpressErrorHandler } from './middleware/ExpressErrorHandler';
import IssuerController from './controllers/IssuerController'

require('dotenv-flow').config();

// Ensure routing-controllers uses typedi for DI
useContainer(Container);

const app = createExpressServer({
    controllers: [AssetController, IssuerController],
    middlewares: [ExpressErrorHandler],
    defaultErrorHandler: false,
});

const port = Number(process.env.PORT)
app.listen(port, (): void => {
    console.log(`Server is running on port ${port}`)
})
