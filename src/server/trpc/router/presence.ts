import { z } from "zod";
import { t, authedProcedure } from "../trpc";

export const presenceRouter = t.router({
    log: authedProcedure
        .input(
            z.object({
                deviceTimestamp: z.date(),
                location: z.object({ longitude: z.number(), latitude: z.number(), accuracy: z.number(), locationTimestamp: z.date() }).nullish(),
            })
        )
        .mutation(({ ctx, input }) => {
            return ctx.prisma.presence.create({
                data: {
                    user: { connect: { id: ctx.session.user.id } },
                    deviceTimestamp: input.deviceTimestamp,
                    serverTimestamp: new Date(),
                    accuracy: input.location?.accuracy,
                    latitude: input.location?.latitude,
                    longitude: input.location?.longitude,
                    locationTimestamp: input.location?.locationTimestamp,
                },
            });
        }),
});
