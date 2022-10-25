// src/server/trpc/router/index.ts
import { t } from "../trpc";
import { presenceRouter } from "./presence";

export const appRouter = t.router({
    presence: presenceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
