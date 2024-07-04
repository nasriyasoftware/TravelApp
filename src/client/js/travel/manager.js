import TravelPlan, { GeoName, TimePeriod } from './TravelPlan.js';

class TravelPlansManager {
    /**@type {TravelPlan[]} */
    #_records = [];
    #_endpoints = {
        queryLocation: '/api/v1/locations'
    }

    constructor() {
        this.#readStorage();
    }

    /**
     * Search for a valid city
     * @param {string} loca 
     * @returns {Promise<GeoName|null>}
     */
    async searchLocation(locationStr) {
        try {
            const httpRes = await fetch(`${this.#_endpoints.queryLocation}?q=${encodeURIComponent(locationStr)}`);
            if (httpRes.status !== 200) {
                throw { message: `Unable to check the location. The server responded with status code #${httpRes.status}`, code: httpRes.status }
            }

            /**@type {SearchLocationResult|SearchLocationError} */
            const response = await httpRes.json();

            if (response.type === 'success') {
                return response.total > 0 ? response.location : null;
            } else {
                throw response;
            }
        } catch (error) {
            if (typeof error?.message === 'string') { error.message = `Unable to search for matching locations ${error.message}` }
            throw error;
        }
    }

    /**
     * Remove a plan by ID
     * @param {string} plan_id 
     */
    removePlan(plan_id) {
        this.#_records = this.#_records.filter(i => i._id !== plan_id);
        this.#updateStorage();
    }

    /**
     * Create a plan
     * @param {string} Plan The plan title
     * @param {TimePeriod} period 
     */
    createPlan(title, period) {
        const plan = new TravelPlan({ title, period }, this.#updateStorage);
        this.#_records.push(plan);
        this.#updateStorage();
        return plan;
    }

    #updateStorage = () => {
        const recs = this.#_records.map(i => i._toJSON());
        localStorage.setItem('plans-cache', JSON.stringify(recs));
    }

    #readStorage() {
        const resourcesStr = localStorage.getItem('plans-cache');
        const arr = (() => {
            try {
                return JSON.parse(resourcesStr);
            } catch (error) {
                return null;
            }
        })();

        const resources = Array.isArray(arr) ? arr : [];
        for (const resource of resources) {
            if ('_id' in resource && 'period' in resource) {
                const plan = new TravelPlan(resource, this.#updateStorage);
                this.#_records.push(plan);
            } else {
                console.warn(`A damaged TravelPlan record was found in the local storage`);
                console.warn(resource);
            }
        }
    }

    get records() { return this.#_records }
}

export default new TravelPlansManager();

/**
 * @typedef {object} SearchLocationResult
 * @prop {'success'} type The response type
 * @prop {GeoName} location The found location
 * @prop {number} total The total number of results
 */

/**
 * @typedef {object} SearchLocationError
 * @prop {'server_error'|'bad_request'} type The response type
 * @prop {string} message The response message
 */