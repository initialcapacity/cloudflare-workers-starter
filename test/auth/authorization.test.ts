import { isAuthorized } from '../../src/auth/authorization';
import { describe, test, expect } from 'vitest';

describe('authorization', () => {
    test('isAuthorized', () => {
        const authorized = isAuthorized("example.com");
        expect(authorized("test@example.com")).toEqual(true)
        expect(authorized("test@anexample.com")).toEqual(false)
    })
})
