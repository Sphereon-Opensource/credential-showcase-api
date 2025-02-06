import 'reflect-metadata';
import {createExpressServer, useContainer} from 'routing-controllers';
import AssetController from './controllers/AssetController';
import Container from "typedi";
import {getDbConnection} from './database/databaseService';

require('dotenv-flow').config();

// Ensure routing-controllers uses typedi for DI
useContainer(Container);

getDbConnection().then((): void => {
    const app = createExpressServer({
        controllers: [AssetController]
    });

    const port = Number(process.env.PORT)
    app.listen(port, (): void => {
        console.log(`Server is running on port ${port}`)
    })
});
