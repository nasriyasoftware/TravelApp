import './types.js';
import lightbox from './components/LightboxManager.js';

const svgParser = new DOMParser();

const helpers = {
    /**
     * Show a message to the user
     * @param {string} message 
     * @returns {Promise<any>}
     */
    showMessage: async (message) => {
        return new Promise((resolve, reject) => {
            lightbox.open('prompt', { content: message }).then(res => resolve(res)).catch(err => reject(err));
        })
    },
    generateId: () => String(Math.floor(Math.random() * 10e10)),
    /**
     * Get the GEO data of a location
     * @param {string} location 
     * @returns {Promise<GeoName}
     */
    getGeoName: async (location) => {
        try {
            const httpRes = await fetch(`/api/v1/locations?q=${encodeURIComponent(location)}`);
            const response = await httpRes.json();

            if (httpRes.ok) {
                return response.location;
            } else {
                if (httpRes.status === 404) { return null }
                throw response;
            }
        } catch (error) {
            throw error;
        }
    },
    /**
     * @param {Coordinates} coordinates 
     * @param {TimePeriod} period 
     * @returns {Promise<WeatherData[]>}
     */
    getForecast: async (coordinates, period) => {
        try {
            const httpRes = await fetch(`/api/v1/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&fromTime=${period.start.getTime()}&toTime=${period.end.getTime()}`);
            const response = await httpRes.json();

            if (httpRes.ok) {
                return response.weather;
            } else {
                if (httpRes.status === 404) { return null }
                throw response;
            }
        } catch (error) {
            throw error;
        }
    },
    /**
     * Create an `svg` DOM element from a string format.
     * @param {string} svgString An svg element in a string format
     * @returns 
     */
    createSVG: (svgString) => {
        return svgParser.parseFromString(svgString, "image/svg+xml").documentElement;
    },
    isRealDate: (value) => {
        const date = new Date(value);
        return !isNaN(date.getTime());
    },
    /**
     * @param {HTMLInputElement} input 
     * @param {string} msg 
     */
    invalidateInput: (input, msg) => {
        input.setCustomValidity(msg);
        const errMsg = document.getElementById(`${input.id}_err_msg`);
        errMsg.lastChild.textContent = input.validationMessage;
        if (errMsg.hasAttribute('hidden')) { errMsg.removeAttribute('hidden') }
    },
    /**
     * @param {HTMLInputElement} input 
     */
    resetValidityIndication: (input) => {
        input.setCustomValidity("");
        const errMsg = document.getElementById(`${input.id}_err_msg`);
        if (!errMsg.hasAttribute('hidden')) { errMsg.setAttribute('hidden', '') }
    },
    /**
     * @param {string} query Any string to get an image about
     * @returns {Promise<string|null>} The `src` of an iamge or `null` if no matches were found
     */
    searchImages: async (query) => {
        try {
            const httpRes = await fetch(`/api/v1/images?q=${encodeURIComponent(query)}`);
            const response = await httpRes.json();

            if (httpRes.ok) {
                return response.src;
            } else {
                if (httpRes.status === 404) { return null }
                throw response;
            }
        } catch (error) {
            throw error;
        }
    },
    timeDifference(date1, date2) {
        // Calculate the difference in milliseconds
        const diff = Math.abs(date2 - date1);

        // Define time units in milliseconds
        const msInSecond = 1000;
        const msInMinute = msInSecond * 60;
        const msInHour = msInMinute * 60;
        const msInDay = msInHour * 24;
        const msInWeek = msInDay * 7;
        const msInMonth = msInDay * 30; // Approximation for a month

        // If the difference is more than or equal to a month, return the earlier date
        if (diff >= msInMonth) {
            return date1 < date2 ? date1 : date2;
        }

        // Calculate the difference in weeks, days, hours, and minutes
        const weeks = Math.floor(diff / msInWeek);
        const days = Math.floor((diff % msInWeek) / msInDay);
        const hours = Math.floor((diff % msInDay) / msInHour);
        const minutes = Math.floor((diff % msInHour) / msInMinute);

        // Determine the human-readable time difference
        if (weeks > 0) {
            return weeks === 1 ? 'a week' : `${weeks} weeks`;
        } else if (days > 0) {
            return days === 1 ? 'a day' : `${days} days`;
        } else if (hours > 0) {
            return hours === 1 ? 'an hour' : `${hours} hr`;
        } else if (minutes > 0) {
            return minutes === 1 ? 'a minute' : `${minutes} min`;
        } else {
            return 'just now';
        }
    }
}

export default helpers