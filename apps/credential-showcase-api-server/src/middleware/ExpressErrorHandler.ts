import { Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers';
import { Service } from 'typedi';
import { NotFoundError } from '../errors/NotFoundError';

@Service()
@Middleware({ type: 'after' })
export class ExpressErrorHandler implements ExpressErrorMiddlewareInterface {
    error(error: any, request: any, response: any, next: (err: any) => any): void {
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
