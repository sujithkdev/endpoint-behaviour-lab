import { createServer } from './server.mjs';

const port = Number(process.env.PORT ?? 4100);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be 1–65535');
const server = createServer();
server.listen(port, '127.0.0.1', () => console.log(`Development skeleton: http://127.0.0.1:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
