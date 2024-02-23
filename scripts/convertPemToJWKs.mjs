/* eslint-disable @typescript-eslint/no-unsafe-call */
import rsaPemToJwk from 'rsa-pem-to-jwk';
import fs from 'fs';

const privateKey = fs.readFileSync('./certs/private.pem');

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const jwk = rsaPemToJwk(privateKey, { use: 'sig' }, 'public');

console.log(JSON.stringify(jwk));