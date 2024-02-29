type PopulatedSession = { userId: number, email: string, accountId: number, accountName: string };
type EmptySession = { userId: null, email: null, accountId: null, accountName: null };
export type UserSession = PopulatedSession | EmptySession

export const isSet = (session: UserSession): session is PopulatedSession =>
    session.userId !== null &&
    session.email !== null &&
    session.accountId !== null &&
    session.accountName !== null
