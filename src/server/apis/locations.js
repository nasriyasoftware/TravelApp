import fs from 'fs';
import geonames from './geonames.js';
const countries = JSON.parse(fs.readFileSync('src/server/assets/countries.json', { encoding: 'utf-8' }));
import nodeFetch from 'node-fetch';

class LocationsManager {
    #_cities_base_url = 'https://api.teleport.org/api/cities';

    countries = {
        /**
         * 
         * @param {string} term 
         * @param {boolean} simplified 
         */
        search: (term, simplified = false) => {

            const results = countries.filter(i => {
                if (i.cca2 === term || i.cca3 === term) { return true }
                if (i.name.common.includes(term) || i.name.official === term) { return true }
                const translations = i.translations;

                for (const lang in translations) {
                    const match = translations[lang].common.includes(term) || translations[lang].official === term;
                    if (match) { return true }
                }
            })

            return simplified ? results.map(i => i.name.common) : results;
        }
    }

    cities = {
        /**
         * 
         * @param {string} term 
         * @deprecated
         */
        search: async (term) => {
            try {
                const url = `${this.#_cities_base_url}/search=${encodeURIComponent(term)}`;
                console.log(url);
                const httpRes = await nodeFetch(url);
                if (httpRes.status !== 200) { throw new Error(`Unexpected API response recieved. The API responded with a status of (${httpRes.status})`) }

                const data = await httpRes.json();
                console.log('city search result', data)
                return data
                return data.count > 0 && data._embedded['city:search-results'].some(city => city.matching_full_name.toLowerCase().includes(name.toLowerCase()));
            } catch (error) {
                if (error instanceof Error) { error.message = `Locations API (cities.search) Error: ${error.message}` }
                return Promise.reject(error);
            }
        }
    }

    handlers = {
        v1: async (req, res) => {
            const searchQ = req.query.q;
            const searchTerm = decodeURIComponent(searchQ);
            if (searchQ === undefined || searchTerm.length === 0) { return res.status(400).json({ type: 'bad_request', message: 'The request is missing the query term' }) }

            try {
                const data = await geonames.search(searchTerm);
                const location = data.geonames[0];

                // Free Palestine 🇵🇸
                if (location.countryCode === 'IL') {
                    location.countryCode = 'PS';
                    location.countryName = 'Palestine';
                    location.countryId = '6254930';
                    location.population = 16183;
                }

                res.json({ type: 'success', location, total: data.totalResultsCount });
            } catch (error) {
                console.error(error);
                return res.status(500).json({
                    code: 500,
                    status: 'server_error',
                    message: error instanceof Error ? error.message : error,
                    stack: error instanceof Error ? error.stack : undefined
                })
            }
        }
    }
}

export default new LocationsManager();