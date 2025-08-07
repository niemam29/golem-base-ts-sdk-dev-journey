import fs from 'fs';
import { Wallet } from '@ethereumjs/wallet';

const keyPath = 'private.key';

if (fs.existsSync(keyPath)) {
  console.log(`File "${keyPath}" already exists. Aborting.`);
  process.exit(0);
}

const wallet = Wallet.generate();
const privateKey = wallet.getPrivateKey();

fs.writeFileSync(keyPath, privateKey);
console.log('Address:', wallet.getAddressString());
