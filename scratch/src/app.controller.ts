import { Controller, Get } from '@nestjs/common';

@Controller('/greet')
export class AppController {
    @Get('/hi')
    getRouteRoute() {
        return 'hi there';
    }

    @Get('/bye')
    getBye() {
        return 'bye there';
    }
}
