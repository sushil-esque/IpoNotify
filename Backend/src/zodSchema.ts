import {z} from "zod"

export const subscriptionSchema = z.object({
    name: z.enum(["general_public", "foreign_employment", "reserved", "all", "none"])
})
