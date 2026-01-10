import { json } from "zod"

type CacheEntry<T> = {
    value: T,
    expiryDate: number
}

const cacheMap = new Map<string, CacheEntry<unknown>>()
const cacheLimit = 500

export function getCache<T>(key: string): T | null{
    const entry = cacheMap.get(key)

    if(!entry || entry?.expiryDate < Date.now()){
        cacheMap.delete(key)
        return null
    }
    console.log(`Get - ${JSON.stringify(cacheMap)}`)
    return entry.value as T
}

export function setCache<T>(key: string, value: T){
    if(cacheMap.size >= cacheLimit){
        const oldKey = cacheMap.keys().next().value
        if(oldKey != undefined)cacheMap.delete(oldKey)
    }

    const expiryDate = Date.now() + (2 * 1000)
    cacheMap.set(key, {value, expiryDate})
    console.log(`Set - ${JSON.stringify(cacheMap)}`)
}

export function clearCache(key: string){
    cacheMap.delete(key)
}