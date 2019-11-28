import Hapi from '@hapi/hapi';
import { something } from './services/utils.js'

const init = async () => {

    const server = Hapi.server({
        port: process.env.PORT || 3001
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {

            return 'Hello World, !' + something;
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
