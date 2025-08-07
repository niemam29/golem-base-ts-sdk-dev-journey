import assert from 'assert';
import type { GolemBaseClient, CreateEntityReceipt } from "golem-base-sdk";

/**
 * Validates all entities created by the sample entities function using assert statements
 * @param client - The GolemBaseClient instance
 * @param receipts - Array of CreateEntityReceipt objects
 */
export async function validateAllEntities(
    client: GolemBaseClient,
    receipts: CreateEntityReceipt[]
): Promise<void> {
    console.log('Starting entity validation with assertions...\n');
    
    const expectedPayloads = ["Welcome to Golem-base!", "Welcome back!"];
    const ownerAddress = await client.getOwnerAddress();

    for (let i = 0; i < receipts.length; i++) {
        const receipt = receipts[i];
        console.log(`Validating Entity ${i + 1} (${receipt.entityKey}):`);

        // Get metadata for the entity
        const metadata = await client.getEntityMetaData(receipt.entityKey);
        
        // Assert owner address matches
        assert(
            metadata.owner.toLowerCase() === ownerAddress.toLowerCase(),
            `Expected owner ${ownerAddress}, but got ${metadata.owner}`
        );
        console.log('✓ Owner address assertion passed');

        // Assert expiration block is a positive number
        assert(
            typeof metadata.expiresAtBlock === 'number' && metadata.expiresAtBlock > 0,
            `Expected positive expiration block number, but got ${metadata.expiresAtBlock}`
        );
        console.log('✓ Expiration block assertion passed');

        // Assert string annotations structure and content based on actual data
        assert(
            Array.isArray(metadata.stringAnnotations),
            'Expected stringAnnotations to be an array'
        );

        if (i === 0) {
            // First entity should have xyz=zzz and abc=def annotations
            const xyzAnnotation = metadata.stringAnnotations.find((ann: any) => ann.key === 'xyz');
            const abcAnnotation = metadata.stringAnnotations.find((ann: any) => ann.key === 'abc');
            
            assert(xyzAnnotation !== undefined, 'Expected to find xyz annotation in stringAnnotations');
            assert(xyzAnnotation.value === 'zzz', `Expected xyz annotation value to be 'zzz', but got '${xyzAnnotation.value}'`);
            
            assert(abcAnnotation !== undefined, 'Expected to find abc annotation in stringAnnotations');
            assert(abcAnnotation.value === 'def', `Expected abc annotation value to be 'def', but got '${abcAnnotation.value}'`);
        } else {
            // Second entity should have aaa=bbb annotation
            const aaaAnnotation = metadata.stringAnnotations.find((ann: any) => ann.key === 'aaa');
            assert(aaaAnnotation !== undefined, 'Expected to find aaa annotation in stringAnnotations');
            assert(aaaAnnotation.value === 'bbb', `Expected aaa annotation value to be 'bbb', but got '${aaaAnnotation.value}'`);
        }
        console.log('✓ String annotations assertion passed');

        // Assert numeric annotations structure and content based on actual data
        assert(
            Array.isArray(metadata.numericAnnotations),
            'Expected numericAnnotations to be an array'
        );

        if (i === 0) {
            // First entity should have num=1 and favorite=2 annotations
            const numAnnotation = metadata.numericAnnotations.find((ann: any) => ann.key === 'num');
            const favoriteAnnotation = metadata.numericAnnotations.find((ann: any) => ann.key === 'favorite');
            
            assert(numAnnotation !== undefined, 'Expected to find num annotation in numericAnnotations');
            assert(numAnnotation.value === 1, `Expected num annotation value to be 1, but got ${numAnnotation.value}`);
            
            assert(favoriteAnnotation !== undefined, 'Expected to find favorite annotation in numericAnnotations');
            assert(favoriteAnnotation.value === 2, `Expected favorite annotation value to be 2, but got ${favoriteAnnotation.value}`);
        } else {
            // Second entity should have num=3 annotation
            const numAnnotation = metadata.numericAnnotations.find((ann: any) => ann.key === 'num');
            assert(numAnnotation !== undefined, 'Expected to find num annotation in numericAnnotations');
            assert(numAnnotation.value === 3, `Expected num annotation value to be 3, but got ${numAnnotation.value}`);
        }
        console.log('✓ Numeric annotations assertion passed');

        // Assert BTL expiration is reasonable (assuming we're not on genesis block)
        const expectedMinExpiration = 20;
        assert(
            metadata.expiresAtBlock >= expectedMinExpiration,
            `Expected expiration block to be at least ${expectedMinExpiration}, but got ${metadata.expiresAtBlock}`
        );
        console.log('✓ BTL expiration assertion passed');

        // Get and validate storage payload
        const decoder = new TextDecoder();
        const storage = decoder.decode(await client.getStorageValue(receipt.entityKey));
        const expectedPayload = expectedPayloads[i];
        
        assert(
            storage === expectedPayload,
            `Expected payload '${expectedPayload}', but got '${storage}'`
        );
        console.log('✓ Storage payload assertion passed');

        console.log(`All assertions passed for entity ${i + 1}\n`);
    }

    console.log('🎉 All entity validations completed successfully!');
}
