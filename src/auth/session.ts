import {UserAccount} from "../accounts/accountsService";

type UserSession = { userId: string, email: string, accountId: string, accountName: string };
type EmptySession = { userId: null, email: null, accountId: null, accountName: null };

export type Session = UserSession | EmptySession

export const emptySession: Session = {
    userId: null,
    email: null,
    accountId: null,
    accountName: null,
}

export const isSet = (session: Session): boolean =>
    session.userId !== null &&
    session.email !== null &&
    session.accountId !== null &&
    session.accountName !== null

export const set = (session: Session, userAccount: UserAccount) => {
    session.userId = userAccount.id;
    session.email = userAccount.email;
    session.accountId = userAccount.accountId;
    session.accountName = userAccount.accountName;
}
