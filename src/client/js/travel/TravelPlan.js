import '../types.js';
import helpers from '../helpers.js';

class TravelPlan {
    #_id;
    #_createdAt = new Date();
    /**@type {string} */
    #_title;

    /**@type {Destination[]} */
    #_destinations = [];
    #_flights = [];
    #_hotelReservations = [];
    #_todos = [];

    /**@type {Date} */
    #_startDate;
    /**@type {Date} */
    #_endDate;

    /**@type {Function} */
    #_updateStorage;

    /**
     * @param {TravelPlanOptions} options 
     * @param {Function} updateStorage
     */
    constructor(options, updateStorage) {
        this.#_updateStorage = updateStorage;

        if (options._id) { this.#_id = options._id } else { this.#_id = helpers.generateId(); }
        if (options._createdAt) { this.#_createdAt = options._createdAt instanceof Date ? options._createdAt : new Date(options._createdAt) }

        this.#_title = options.title
        if (Array.isArray(options.destinations)) { this.#_destinations = options.destinations }

        this.#_startDate = options.period.start instanceof Date ? options.period.start : new Date(options.period.start);
        this.#_endDate = options.period.end instanceof Date ? options.period.end : new Date(options.period.end);

        if (Array.isArray(options.destinations)) {
            for (const item of options.destinations) {
                item.period.start = new Date(item.period.start);
                item.period.end = new Date(item.period.end);
            }

            this.#_destinations = options.destinations;
        }
        
    }

    get _id() { return this.#_id }
    get _createdAt() { return this.#_createdAt }

    get title() { return this.#_title }
    set title(value) {
        this.#_title = value;
        this.#_updateStorage();
    }

    get destinations() { return this.#_destinations }

    /**
     * Add a destination to your plan
     * @param {string} name 
     * @param {TimePeriod} period 
     */
    async addDestination(name, period) {
        try {
            const geo = await helpers.getGeoName(name);
            if (!geo) { throw new Error(`No geo data was found for ${name}`) }
            if (this.#_destinations.filter(i => i._id === geo.geonameId).length > 0) { throw { type: 'bad_request', message: `The destination ${geo.name} is already on your plan.` } }
            const weather = await helpers.getForecast({ lat: geo.lat, lon: geo.lng }, period);

            /**@type {Destination} */
            const dest = { _id: geo.geonameId, geo, period, weather, lastUpdate: new Date() }
            this.#_destinations.push(dest);

            this.#_destinations.sort((a, b) => {
                if (a.period.start < b.period.start) { return -1 }
                if (a.period.start > b.period.start) { return 1 }
                return 0;
            })

            return dest;
        } catch (error) {
            throw error;
        } finally {
            this.#_updateStorage();
        }
    }

    /**
     * Remove a destination from your plan by providing
     * the ID of that destination
     * @param {string} destination_id 
     */
    removeDestination(destination_id) {
        // Find the index of the destination with the given ID
        const index = this.#_destinations.findIndex(dest => String(dest._id) === destination_id);

        // Check if the destination was found
        if (index === -1) { throw new Error(`Unable to remove destionation: ${destination_id} is not a valid destination`) }

        // Remove the destination from the array
        this.#_destinations.splice(index, 1);

        // Udpate the storage
        this.#_updateStorage();
    }

    get from() { return this.#_startDate }
    get to() { return this.#_endDate }
    get flights() { return this.#_flights }
    get hotelReservations() { return this.#_hotelReservations }
    get todos() { return this.#_todos }    

    _toJSON() {
        return {
            _id: this.#_id,
            _createdAt: this.#_createdAt.toISOString(),
            title: this.#_title,
            period: {
                start: this.#_startDate.toISOString(),
                end: this.#_endDate.toISOString()
            },
            destinations: this.#_destinations
        }
    }
}

export default TravelPlan;