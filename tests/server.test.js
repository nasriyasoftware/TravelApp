import server from '../src/server/server.js';

describe('Server Side (Backend) Tests', () => {
    test('the app is exported correctly', () => expect(server).toBeDefined());
})

server.close();