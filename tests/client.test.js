import CustomDate from "../src/client/js/components/CustomDate.js";

describe('Client Side (Frontend) Tests', () => {
    describe('Testing CustomDate', () => {
        test('CustomDate is defined', () => expect(CustomDate).toBeDefined());
        test('CustomDate is extended from Date', () => expect(new CustomDate() instanceof Date).toBe(true));
    })
})