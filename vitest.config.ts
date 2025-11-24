import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        setupFiles: [],
        include: ["test/**/*.test.ts"],
        testTimeout: 120000, // optional global timeout
    },
});
