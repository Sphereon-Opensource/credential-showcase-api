import { Middleware, ExpressErrorMiddlewareInterface, HttpError, UnauthorizedError } from 'routing-controllers';
import { Service } from 'typedi';
import { Response } from 'express';
import { NotFoundError } from '../errors/NotFoundError';

@Service()
@Middleware({ type: 'after' })
export class ExpressErrorHandler implements ExpressErrorMiddlewareInterface {
    error(error: HttpError | UnauthorizedError, request: Request, response: Response, next: (err: any) => any): void {
        if (error instanceof NotFoundError) {
            response.status(404).json({
                message: error.message ?? 'Not Found',
            });
        } else {
            response.status(500).json({
                message: error.message ?? 'Internal server error',
            });
        }
    }
}
