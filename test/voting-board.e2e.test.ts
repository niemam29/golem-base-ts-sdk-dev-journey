// test/voting-board.e2e.test.ts
import { describe, it, expect } from "vitest";

// === These imports exactly match main.py's JavaScript wrapper ===
import {
    createWalletClient,
    createPublicClient,
    http,
    bytesToString,
} from "@arkiv-network/sdk";

import { privateKeyToAccount } from "viem/accounts";
import { eq } from "@arkiv-network/sdk/query";
import { stringToPayload } from "@arkiv-network/sdk/utils";
import {mendoza} from "@arkiv-network/sdk/chains";

// === Config ===
const RPC_URL =
    process.env.RPC_URL || "https://mendoza.hoodi.arkiv.network/rpc";

// IMPORTANT: This must be a TESTNET KEY, never mainnet
const PRIVATE_KEY =
    process.env.PRIVATE_KEY ||
    "0x1e951be867cba332c76e83ca9f0e55fffcd858f574973a5feac3148b308ff8ae"; // same mock default as your playground

describe("Arkiv – Voting Board (same imports as playground)", () => {
    const timeoutMs = 1090000;

    it(
        "opens proposal, casts votes, batches votes and tallies correctly",
        async () => {
            // === 1) Clients (matches Getting Started) ===
            const walletClient = createWalletClient({
                chain: mendoza,
                transport: http(RPC_URL),
                account: privateKeyToAccount(PRIVATE_KEY as `0x${string}`),
            });

            const publicClient = createPublicClient({
                chain: mendoza,
                transport: http(RPC_URL),
            });

            const enc = new TextEncoder();
            const dec = new TextDecoder();

            // === 2) Open Proposal ===
            const { entityKey: proposalKey } = await walletClient.createEntity({
                payload: enc.encode("Proposal: Should we stand-up at 9:30?"),
                contentType: "text/plain",
                attributes: [
                    { key: "type", value: "proposal" },
                    { key: "status", value: "open" },
                    { key: "version", value: "1" },
                ],
                expiresIn: 180,
            });

            expect(proposalKey).toMatch(/^0x[a-fA-F0-9]+$/);

            // === 3) Single NO vote ===
            const voter = walletClient.account.address;

            await walletClient.mutateEntities({
                creates: [
                    {
                        payload: enc.encode("vote: no"),
                        contentType: "text/plain",
                        attributes: [
                            { key: "type", value: "vote" },
                            { key: "proposalKey", value: proposalKey },
                            { key: "voter", value: voter },
                            { key: "choice", value: "no" },
                            { key: "weight", value: "1" },
                        ],
                        expiresIn: 180,
                    },
                ],
            });

            // === 4) Batch YES votes ===
            const creates = Array.from({ length: 3 }, (_, i) => ({
                payload: enc.encode(`vote: yes #${i + 1}`),
                contentType: "text/plain",
                attributes: [
                    { key: "type", value: "vote" },
                    { key: "proposalKey", value: proposalKey },
                    { key: "voter", value: `${voter}-bot${i}` },
                    { key: "choice", value: "yes" },
                    { key: "weight", value: "1" },
                ],
                expiresIn: 180,
            }));

            await walletClient.mutateEntities({ creates });

//
// --- 5) Tally YES votes — wait until they appear ---
//
            await expect
                .poll(
                    async () => {
                        const yes = await publicClient
                            .buildQuery()
                            .where([
                                eq("type", "vote"),
                                eq("proposalKey", proposalKey),
                                eq("choice", "yes"),
                            ])
                            .fetch();

                        return yes.entities.length;
                    },
                    {
                        interval: 750,   // check every 0.75s
                        timeout: 30_000, // wait up to 30 seconds
                    }
                )
                .toBeGreaterThanOrEqual(3);


//
// --- 6) Tally NO votes — also wait until it appears ---
//
            await expect
                .poll(
                    async () => {
                        const no = await publicClient
                            .buildQuery()
                            .where([
                                eq("type", "vote"),
                                eq("proposalKey", proposalKey),
                                eq("choice", "no"),
                            ])
                            .fetch();

                        return no.entities.length;
                    },
                    {
                        interval: 750,
                        timeout: 30_000,
                    }
                )
                .toBeGreaterThanOrEqual(1);


            // === 7) Extend proposal ===
            const extend = await walletClient.extendEntity({
                entityKey: proposalKey,
                expiresIn: 120,
            });

            expect(extend.txHash).toMatch(/^0x[a-fA-F0-9]+$/);
            expect(extend.entityKey).toBe(proposalKey);
        },
        timeoutMs
    );
});
