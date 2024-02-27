import {Context} from "hono";
import {getSignedCookie, setSignedCookie} from "hono/cookie";

export type Session<T> = {
    get: () => Promise<T>
    set: (data: T) => Promise<void>
}

export const session = <T, C extends Context>(cookieName: string, secret: string, c: C, defaultSession: T) => {
    return {
        get: async (): Promise<T> => {
            const cookie = await getSignedCookie(c, secret, cookieName)
            if (cookie === false || cookie === undefined) {
                return defaultSession;
            }

            try {
                return JSON.parse(cookie)
            } catch {
                return defaultSession
            }
        },
        set: (data: T): Promise<void> => setSignedCookie(c, cookieName, JSON.stringify(data), secret)
    }
}
