import { Code } from '../../../src/domain/entities/code';

describe('Code', () => {
    describe('constructor', () => {
        it('should create a code with current date if none provided', () => {
            const codeValue = 'test-code';
            const code = new Code(codeValue);

            expect(code.code).toBe(codeValue);
            expect(code.createdAt).toBeInstanceOf(Date);
            expect(Math.abs(code.createdAt.getTime() - Date.now())).toBeLessThan(1000);
        });

        it('should create a code with provided date', () => {
            const codeValue = 'test-code';
            const testDate = new Date('2023-01-01');
            const code = new Code(codeValue, testDate);

            expect(code.code).toBe(codeValue);
            expect(code.createdAt).toEqual(testDate);
        });
    });

    describe('isExpired', () => {
        it('should return false for a newly created code', () => {
            const code = new Code('test-code');
            expect(code.isExpired()).toBe(false);
        });

        it('should return true for a code older than 1 hour', () => {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000 - 1000); // 1 hour + 1 second ago
            const code = new Code('test-code', oneHourAgo);
            expect(code.isExpired()).toBe(true);
        });

        it('should return false for a code just under 1 hour old', () => {
            const justUnderOneHourAgo = new Date(Date.now() - 60 * 60 * 1000 + 1000); // 1 hour - 1 second ago
            const code = new Code('test-code', justUnderOneHourAgo);
            expect(code.isExpired()).toBe(false);
        });
    });
});