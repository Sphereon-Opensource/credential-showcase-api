import 'reflect-metadata'
import { createExpressServer, useContainer } from 'routing-controllers'
import Container from 'typedi'
import AssetController from './controllers/AssetController'
import { ExpressErrorHandler } from './middleware/ExpressErrorHandler'
import morgan from 'morgan'
import { Request, Response } from 'express'
import PersonaController from './controllers/PersonaController'
require('dotenv-flow').config()

// Ensure routing-controllers uses typedi for DI
useContainer(Container)

const app = createExpressServer({
  controllers: [AssetController, PersonaController],
  middlewares: [ExpressErrorHandler],
  defaultErrorHandler: true,
})

app.use(morgan('dev'))

app.get('/', function (req: Request, res: Response) {
  res.send('hello, world!')
})

const port = Number(process.env.PORT)
app.listen(port, (): void => {
  console.log(`Server is running on port ${port}`)
})
