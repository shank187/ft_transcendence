import { z } from "zod";

// Discarding is the only status change the client can ask for here;
// finishing has its own route.
export const discardSessionBody = z.object({
    status: z.literal("CANCELLED"),
});
