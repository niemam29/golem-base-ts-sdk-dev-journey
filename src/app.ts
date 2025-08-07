import * as fs from "fs"
import { validateAllEntities } from "./assertions.js"

import {
  createClient,
  type GolemBaseCreate,
  Annotation,
  Tagged,
  type AccountData,
  type GolemBaseClient,
  type CreateEntityReceipt
} from "golem-base-sdk"

const filename = 'private.key'; // If your private.key file is elsewhere, add its path to this string.
if (!fs.existsSync(filename)) {
    console.log(`File "${filename}" not found. Aborting.`);
    process.exit(0);
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const keyBytes = fs.readFileSync(filename);
const key: AccountData = new Tagged("privatekey", keyBytes)

const client: GolemBaseClient = await createClient(
    60138453025, // The id of  the node.
    key,
    'https://kaolin.holesky.golem-base.io/rpc', // The http address
    'wss://kaolin.holesky.golem-base.io/rpc/ws'  // The web socket address
)

async function createSampleEntities(): Promise<CreateEntityReceipt[]> {
    const creates: GolemBaseCreate[] = [
        {
            data: encoder.encode("Welcome to Golem-base!"), // We need to encode the string to an array of integers
            btl: 25,
            stringAnnotations: [new Annotation("xyz", "zzz"), new Annotation("abc", "def")],
            numericAnnotations: [new Annotation("num", 1), new Annotation("favorite", 2)]
        },
        {
            data: encoder.encode("Welcome back!"),
            btl: 30,
            stringAnnotations: [new Annotation("aaa", "bbb")],
            numericAnnotations: [new Annotation("num", 3)]
        }
    ];

    try {
        const receipts: CreateEntityReceipt[] = await client.createEntities(creates);
        return receipts;
    }
    catch (e) {
        console.log('Error:');
        console.log((e as Error).message)
    }

    return [];
}

async function main() {
    // Call our functinon to create the entities. This will return an 
    // array of receipts. Each receipt contains an entity hash code, and a BTL.
    const create_receipts: CreateEntityReceipt[] = await createSampleEntities();

    // Loop through the receipts
    for (const receipt of create_receipts) {

        console.log(`Entity ${receipt.entityKey}:`)

        // Obtain the metadata for the entity

        const metadata = await client.getEntityMetaData(receipt.entityKey);
        console.log('Metadata:');
        console.log(metadata);

        // getStorageValue returns the data saved with the entity as an array of integers;
        // thus we need to decode it using the runtime's built-in TextDecoder class.
        const storage = decoder.decode(await client.getStorageValue(receipt.entityKey))
        console.log('Payload:')
        console.log(storage);

    }

    await validateAllEntities(client, create_receipts);

    // Print out the balance

    const address = await client.getOwnerAddress();

    const balanceWei = await client.getRawClient().httpClient.getBalance({
        address: address,
        blockTag: 'latest'
    });

    console.log(`Balance for address ${address} (Wei, Eth):`);
    console.log(`${balanceWei} Wei, ${balanceWei / 10n ** 18n} Eth`);

}

main()