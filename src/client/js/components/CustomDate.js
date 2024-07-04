class CustomDate extends Date {
    constructor(value) {
        if (value instanceof Date) { value = value.toISOString() }
        super(value);
    }

    toCustomString() {
        const now = new Date();
        const targetDate = this;

        // Calculate the difference in time
        const timeDifference = targetDate - now;

        // Calculate the difference in days
        const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

        // If the date is less than a week away
        if (daysDifference <= 7 && daysDifference >= 1) {
            return `in ${daysDifference} day${daysDifference > 1 ? 's' : ''}`;
        }

        // For dates that are more than a week away, format based on the browser's locale
        return targetDate.toLocaleDateString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    toISODateString() { return this.toISOString().split('T')[0] }
}

export default CustomDate;