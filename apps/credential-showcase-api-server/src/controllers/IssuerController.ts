import {
  Body,
  Delete,
  Get,
  HttpCode,
  JsonController,
  OnUndefined,
  Param,
  Post,
  Put
} from 'routing-controllers'
import { Service } from 'typedi'
import { Issuer, NewIssuer } from '../types'
import IssuerService from '../services/IssuerService'

@JsonController('/issuers')
@Service()
class IssuerController {
  constructor(private issuerService: IssuerService) { }

  @Get('/')
  public async getAll() {
    return this.issuerService.getIssuers()
  }

  @Get('/:id')
  getOne(@Param('id') id: string) {
    return this.issuerService.getIssuer(id);
  }

  @HttpCode(201)
  @Post('/')
  post(@Body() issuer: NewIssuer) {
    return this.issuerService.createIssuer(issuer);
  }

  @Put('/:id')
  put(@Param('id') id: string, @Body() issuer: Issuer) {
    return this.issuerService.updateIssuer(id, issuer)
  }

  @OnUndefined(204)
  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.issuerService.deleteIssuer(id);
  }
}

export default IssuerController
