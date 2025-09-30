// FILE: voting-board-getting-started.ts
// TITLE: Voting Board — Getting Started
// USE CASE: Open a proposal, collect votes in real time, tally them, batch more votes, then extend the voting window.

// -----------------------------------------------
// 0) Setup & Client
// -----------------------------------------------
import 'dotenv/config';
import { createClient, Annotation, Tagged, type AccountData, type GolemBaseCreate } from 'golem-base-sdk';
import { randomUUID } from 'crypto';

async function main() {
    // Read env (provide your own values in a .env file)
    const rawKey = process.env.PRIVATE_KEY ?? '';
    if (!rawKey) throw new Error('Missing PRIVATE_KEY in .env');
    const hex = rawKey.startsWith('0x') ? rawKey.slice(2) : rawKey;
    const key: AccountData = new Tagged('privatekey', Buffer.from(hex, 'hex'));

    const chainId = Number(process.env.CHAIN_ID ?? '17000'); // example: Holesky
    const rpcUrl = process.env.RPC_URL ?? 'https://ethwarsaw.holesky.golemdb.io/rpc';
    const wsUrl  = process.env.WS_URL  ?? 'wss://ethwarsaw.holesky.golemdb.io/rpc/ws';

    // Create client
    const client = await createClient(chainId, key, rpcUrl, wsUrl);
    console.log('Connected to Golem Base testnet.');

    // Small helpers
    const enc = new TextEncoder();
    const decoder = new TextDecoder();

    // Keep references for cleanup
    let stopWatching: (() => void) | null = null;

    try {
        // -----------------------------------------------
        // 1) MEET THE NETWORK
        // Connect to Golem Base and say hello.
        // -----------------------------------------------
        const owner = await (client as any).getOwnerAddress?.();
        if (owner) console.log('Your account:', owner);

        // -----------------------------------------------
        // 2) OPEN THE PROPOSAL BOX
        // Create your first proposal — the voting window is its BTL.
        // -----------------------------------------------
        const proposalId = randomUUID();

        const [proposal] = await client.createEntities([
            {
                data: enc.encode('Proposal: Switch stand-up to 9:30?'),
                btl: 200, // voting window length
                stringAnnotations: [
                    new Annotation('type', 'proposal'),
                    new Annotation('proposalId', proposalId),
                    new Annotation('status', 'open'),
                ],
                numericAnnotations: [new Annotation('version', 1)],
            } as GolemBaseCreate,
        ]);
        console.log('Proposal key:', proposal.entityKey);

        // -----------------------------------------------
        // 3) CAST YOUR VOTES
        // Each vote is a small entity linked by proposalId.
        // -----------------------------------------------
        const [vote1, vote2] = await client.createEntities([
            {
                data: enc.encode('vote: yes'),
                btl: 200,
                stringAnnotations: [
                    new Annotation('type', 'vote'),
                    new Annotation('proposalId', proposalId),
                    new Annotation('voter', 'ana'),
                    new Annotation('choice', 'yes'),
                ],
                numericAnnotations: [new Annotation('weight', 1)],
            },
            {
                data: enc.encode('vote: no'),
                btl: 200,
                stringAnnotations: [
                    new Annotation('type', 'vote'),
                    new Annotation('proposalId', proposalId),
                    new Annotation('voter', 'bo'),
                    new Annotation('choice', 'no'),
                ],
                numericAnnotations: [new Annotation('weight', 1)],
            },
        ] as GolemBaseCreate[]);
        console.log('Votes cast:', vote1.entityKey, vote2.entityKey);

        // -----------------------------------------------
        // 4) COUNT THE VOICES
        // Query totals by choice and show a quick tally.
        // -----------------------------------------------
        const yesVotes = await client.queryEntities(
            `type = "vote" && proposalId = "${proposalId}" && choice = "yes"`
        );
        const noVotes = await client.queryEntities(
            `type = "vote" && proposalId = "${proposalId}" && choice = "no"`
        );
        console.log(`Tallies — YES: ${yesVotes.length}, NO: ${noVotes.length}`);

        // -----------------------------------------------
        // 5) LISTEN TO THE CROWD
        // Watch votes arrive in real time.
        // -----------------------------------------------
        stopWatching = client.watchLogs({
            fromBlock: BigInt(0),
            onCreated: (e) => {
                // Peek at created entity type (optional)
                void (async () => {
                    try {
                        const meta = await (client as any).getEntityMetaData?.(e.entityKey);
                        const strs = Object.fromEntries((meta?.stringAnnotations ?? []).map((a: any) => [a.key, a.value]));
                        if (strs.type === 'vote') {
                            const data = await client.getStorageValue(e.entityKey);
                            console.log('New vote:', decoder.decode(data), 'key=', e.entityKey);
                        } else if (strs.type === 'proposal') {
                            console.log('New proposal entity:', e.entityKey);
                        } else {
                            console.log('New entity:', e.entityKey);
                        }
                    } catch {
                        console.log('New entity:', e.entityKey);
                    }
                })();
            },
            onUpdated: (e) => console.log('Updated:', e.entityKey),
            onExtended: (e) => console.log('Extended:', e.entityKey),
            onDeleted: (e) => console.log('Deleted:', e.entityKey),
            onError: (err) => console.error('[watchLogs] error:', err),
        });
        console.log('Watching for new votes/events…');

        // -----------------------------------------------
        // 6) OPEN THE DOORS WIDER
        // Need more time? Extend the proposal’s BTL.
        // -----------------------------------------------
        const [ext] = await client.extendEntities([
            { entityKey: proposal.entityKey, numberOfBlocks: 150 },
        ]);
        console.log('Proposal extended to block:', ext.newExpirationBlock);

        // (Optional) Keep process alive briefly to catch some events in a demo
        // await new Promise((r) => setTimeout(r, 5000));
    } catch (err) {
        console.error('Unexpected error:', err);
    } finally {
        // Cleanup
        try {
            if (stopWatching) stopWatching();
        } catch {}
        // (No disconnect() method on TS client)
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
