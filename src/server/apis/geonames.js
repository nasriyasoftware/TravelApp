import axios from "axios";

class Geonames {
    #_Base_URL = 'http://api.geonames.org/searchJSON';
    #_API_Username = process.env.GEONAMES_API_KEY;

    /**
     * Search by the city name
     * @param {string} city The city text to search for
     * @returns {Promise<GeoNamesResponse>}
     */
    async search(city) {
        try {
            if (typeof city !== 'string') { throw new Error(`The city name must be a string value, instead got ${typeof city}`) }

            const httpRes = await axios.get(`${this.#_Base_URL}?q=${encodeURIComponent(city)}&username=${this.#_API_Username}&lang=en&featureClass=P`);
            if (httpRes.status !== 200) { throw new Error(`Unexpected API response recieved. The API responded with a status of (${httpRes.status})`) }

            return httpRes.data;
        } catch (error) {
            if (error instanceof Error) { error.message = `Geonames API (search) Error: ${error.message}` }
            return Promise.reject(error);
        }
    }
}

export default new Geonames();

/**
 * @typedef {Object} GeoNamesResponse
 * @property {number} totalResultsCount - The total number of results found.
 * @property {GeoName[]} geonames - An array of GeoName objects.
 */

/**
 * @typedef {Object} GeoName
 * @property {string} adminCode1 - The administrative code of the region.
 * @property {string} lng - The longitude of the location.
 * @property {number} geonameId - The unique identifier for the geographical name.
 * @property {string} toponymName - The toponym name of the location.
 * @property {string} countryId - The unique identifier for the country.
 * @property {string} fcl - The feature class of the location.
 * @property {number} population - The population of the location.
 * @property {string} countryCode - The ISO 3166-1 alpha-2 country code.
 * @property {string} name - The name of the location.
 * @property {string} fclName - The full name of the feature class.
 * @property {AdminCodes1} adminCodes1 - An object containing administrative codes.
 * @property {string} countryName - The name of the country.
 * @property {string} fcodeName - The full name of the feature code.
 * @property {string} adminName1 - The name of the administrative region.
 * @property {string} lat - The latitude of the location.
 * @property {string} fcode - The feature code of the location.
 */

/**
 * @typedef {Object} AdminCodes1
 * @property {string} ISO3166_2 - The ISO 3166-2 code for the administrative region.
 */