describe('Date test', () => {
    let mockDate;

    beforeAll(() => {
        // Save the original Date object
        mockDate = Date;

        // Mock the global Date object
        global.Date = jest.fn(() => new mockDate('2020-01-01T00:00:00.000Z'));
    });

    afterAll(() => {
        // Restore the original Date object
        global.Date = mockDate;
    });

    it('should return the mocked date', () => {
        expect(new Date().toISOString()).toBe('2020-01-01T00:00:00.000Z');
    });
});