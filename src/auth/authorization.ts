export const isAuthorized = (authorizedDomain: string) =>
    (email: string): boolean => email.endsWith(`@${authorizedDomain}`);
