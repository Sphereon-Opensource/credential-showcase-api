import 'reflect-metadata';
import { createExpressServer, useContainer } from 'routing-controllers';
import Container from 'typedi';
import AssetController from './controllers/AssetController';
import { ExpressErrorHandler } from './handlers/ExpressErrorHandler';

require('dotenv-flow').config();

// Ensure routing-controllers uses typedi for DI
useContainer(Container);

const app = createExpressServer({
    controllers: [AssetController],
    middlewares: [ExpressErrorHandler],
    defaultErrorHandler: false,
});

const port = Number(process.env.PORT)
app.listen(port, (): void => {
    console.log(`Server is running on port ${port}`)
})
