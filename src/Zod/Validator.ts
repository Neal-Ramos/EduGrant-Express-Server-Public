import { NextFunction, Request, Response } from "express";
import z, { ZodObject, ZodRawShape } from "zod";


export const validate = <T extends ZodObject<any>>(schema: T) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies
    })
    if(!result.success){
        res.status(422).json(z.treeifyError(result.error).properties)
        return
    }

    (req as Request & { validated: z.infer<T> }).validated = result.data
    next()
}

export const toInt = () => {
    return z.union([z.string(), z.number()]).transform((val, cxt) => {
        const n = typeof val === "string"? Number(val):val
        if(!Number.isInteger(n)){
            cxt.addIssue({code: "custom", message:"Invalid Integer!"}) 
            return z.NEVER
        }
        return n
    })
}
export const toJSON = () => {
    return z.string().transform((val, cxt) => {
        try {
            const parsed = JSON.parse(val)
            return parsed
        } catch (error) {
            cxt.addIssue({code:"custom", message:"Invalid JSON Format!"})
            return z.NEVER
        }
    })
}
export const toDate = () => {
    return z.union([z.string(), z.date(), z.number()]).transform((val, cxt) => {
        const d = new Date(val)
        if(isNaN(d.getTime())){
            cxt.addIssue({code:"custom", message: "Invalid Time Format!"})
            return z.NEVER
        }
        return d
    })
}