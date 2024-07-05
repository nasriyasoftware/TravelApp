import express from 'express';
import axios from "axios";

class Weatherbit {
    #_API_Key = process.env.WEATHERBIT_API_KEY;
    #_Base_URL = {
        current: 'https://api.weatherbit.io/v2.0/current',
        /**Up to 16 days in the future */
        future: 'https://api.weatherbit.io/v2.0/forecast/daily',
        icons: `https://www.weatherbit.io/static/img/icons/<=iconCode=>.png`
    }

    #_helpers = {
        isRealDate: (value) => {
            const date = new Date(value);
            return !isNaN(date.getTime());
        }
    }

    /**
     * Get the current weather forecast for specific coordinates
     * @param {Coordinates} coordinates The location coordinates
     * @param {MeasurementSystem} [system] 
     * @returns {Promise<CurrentWeatherResponse>}
     */
    async current(coordinates, system = 'Metric') {
        try {
            // Validate the options
            if (!(typeof coordinates === 'object' && Object.keys(coordinates).length === 2)) { throw new TypeError(`The "current" method expects a valid coordinates object as the first argument`) }
            if (typeof coordinates.lat !== 'number' || typeof coordinates.lon !== 'number') { throw new TypeError(`The "coordinates.lon" and "coordinates.lat" are expecting numbers. type of lon was ${typeof coordinates.lon} and type of lat was ${typeof coordinates.lat}`) }
            if (!(system === 'Imperial' || system === 'Metric' || system === 'Scientific')) { throw new TypeError(`The measurement system can only be "Imperial", "Metric", or "Scientific". You passed: ${system}`) }

            // Build the URL
            const unit = system[0];
            const url = `${this.#_Base_URL.current}?lat=${coordinates.lat}&lon=${coordinates.lon}&units=${unit}&key=${this.#_API_Key}`;

            const httpRes = await axios.get(url);
            if (httpRes.status !== 200) { throw new Error(`Unexpected API response recieved. The API responded with a status of (${httpRes.status})`) }

            return httpRes.data;
        } catch (error) {
            if (error instanceof Error) { error.message = `Weatherbit API (current) Error: ${error.message}` }
            return Promise.reject(error);
        }
    }

    /**
     * Get the future weather forecast in specific time period
     * @param {FutureByCoordinates|FutureByCityName|FutureByCityId|FutureByZIP} options 
     * @param {TimePeriod} period 
     * @param {MeasurementSystem} [system] 
     * @returns {Promise<FutureWeatherResponse>}
     */
    async future(options, period, system = 'Metric') {
        try {
            // Validate the options
            if (!(typeof options === 'object' && Object.keys(options).length > 0)) { throw new TypeError(`The options parameter expect a valid object, instead got ${typeof options}`) }
            if (!('by' in options)) { throw new SyntaxError(`The options argument is missing the "by" property`) }

            let url = this.#_Base_URL.future;
            // Update the URL based on the input
            switch (options.by) {
                case 'Coordinates': {
                    if (!('coordinates' in options)) { throw new SyntaxError(`The options object was specified as "${options.by}" but is missing the "coordinates" object`) }
                    if (!(typeof options.coordinates === 'object' && Object.keys(options.coordinates).length === 2)) { throw new TypeError(`The "future" method expects a valid coordinates object as the first argument`) }
                    if (typeof options.coordinates.lat !== 'number' || typeof options.coordinates.lon !== 'number') { throw new TypeError(`The "coordinates.lon" and "coordinates.lat" are expecting numbers. type of lon was ${typeof options.coordinates.lon} and type of lat was ${typeof options.coordinates.lat}`) }

                    url += `?lat=${options.coordinates.lat}&lon=${options.coordinates.lon}`;
                }
                    break;

                case 'City Name': {
                    if (!('cityName' in options)) { throw new SyntaxError(`The options object was specified as "${options.by}" but is missing the "cityName" value`) }
                    if (typeof options.cityName !== 'string') { throw new TypeError(`The "cityName" expects a string value, but instead got ${typeof options.cityName}`) }

                    url += `?city=${options.cityName}`;
                }
                    break;

                case 'City ID': {
                    if (!('cityId' in options)) { throw new SyntaxError(`The options object was specified as "${options.by}" but is missing the "cityId" value`) }
                    if (typeof options.cityId !== 'string') { throw new TypeError(`The "cityId" expects a string value, but instead got ${typeof options.cityId}`) }

                    url += `?city_id=${options.cityId}`;
                }
                    break;

                case 'ZIP Code': {
                    if (!('zip' in options)) { throw new SyntaxError(`The options object was specified as "${options.by}" but is missing the "zip" value`) }
                    if (typeof options.cityId !== 'string') { throw new TypeError(`The "zip" expects a string value, but instead got ${typeof options.zip}`) }

                    url += `?postal_code=${options.zip}`;
                }
                    break;

                default: {
                    throw new TypeError(`You cannot get the future forecast by ${options.by}. Invalid "by" type`);
                }
            }

            // validate the period
            if (!(typeof period === 'object' && Object.keys(period).length > 0)) { throw new TypeError(`The period parameter expect a valid object, instead got ${typeof period}`) }
            if (!('start' in period && 'end' in period)) { throw new SyntaxError(`The "period" parameter expects an object with two properties, "start" and "end". One or more required properties are missing`) }

            if (!(period.start instanceof Date)) { throw new TypeError(`The "period.start" property is expecting a Date instance, instead got ${typeof period.start}`) }
            if (!(period.end instanceof Date)) { throw new TypeError(`The "period.end" property is expecting a Date instance, instead got ${typeof period.end}`) }
            if (period.end <= period.start) { throw new SyntaxError(`Period Error: The ending date cannot be before the starting date.`) }

            const startStr = period.start.toISOString().split('T')[0];
            const endStr = period.end.toISOString().split('T')[0];

            url += `&start_date=${startStr}&end_date=${endStr}`;

            // Validate the system
            if (!(system === 'Imperial' || system === 'Metric' || system === 'Scientific')) { throw new TypeError(`The measurement system can only be "Imperial", "Metric", or "Scientific". You passed: ${system}`) }
            const unit = system[0];
            url += `&units=${unit}`;

            // Appending the API key
            url += `&key=${this.#_API_Key}`;

            // Send the request
            const httpRes = await axios.get(url);
            if (httpRes.status !== 200) { throw new Error(`Unexpected API response recieved. The API responded with a status of (${httpRes.status})`) }

            return httpRes.data;
        } catch (error) {
            if (error instanceof Error) { error.message = `Weatherbit API (future) Error: ${error.message}` }
            return Promise.reject(error);
        }
    }

    handlers = {
        /**
         * @param {express.Request} req 
         * @param {express.Response} res 
         */
        v1: async (req, res) => {
            try {
                /**@type {{type: 'future', fromTime: Date, toTime: Date}|{type: 'current'}} */
                const request = (() => {
                    const time = Number(req.query.fromTime); // Convert the timestamp from the query to a number
                    if (time) {
                        if (!this.#_helpers.isRealDate(time)) { res.status(400).json({ type: 'bad_request', message: 'The request "fromTime" does not represent a valid date' }); return }

                        const fromTime = new Date(time);
                        const now = new Date();
                        if (fromTime < now) { res.status(400).json({ type: 'bad_request', message: 'The request "fromTime" cannot be in the past' }); return }

                        let toTime;
                        if ('toTime' in req.query) {
                            const toTimeStr = Number(req.query.toTime);
                            if (!this.#_helpers.isRealDate(toTimeStr)) { res.status(400).json({ type: 'bad_request', message: 'The request "toTime" does not represent a valid date' }); return }

                            toTime = new Date(toTimeStr);
                            if (toTime < fromTime) { res.status(400).json({ type: 'bad_request', message: 'The request "toTime" cannot be before the "fromTime"' }); return }
                        } else {
                            toTime = new Date(fromTime.getTime() + 24 * 60 * 60 * 1000);
                        }

                        return { type: 'future', fromTime, toTime }
                    } else {
                        return { type: 'current' }
                    }
                })();

                if (!request) { return }

                if (request.type === 'current') {
                    const { lon, lat } = req.query;
                    if (lon === undefined || lat === undefined || lon.length === 0 || lat.length === 0) { return res.status(400).json({ type: 'bad_request', message: 'The request query params "lat" and/or "lon" are invalid' }) }

                    const response = await this.current({ lat: Number(lat), lon: Number(lon) });
                    return res.json({ type: 'success', weather: response.data[0] });
                }

                if (request.type === 'future') {
                    /**@type {FutureByCoordinates|FutureByCityName|FutureByCityId|FutureByZIP} */
                    const options = (() => {
                        const query = req.query;

                        if ('lon' in query || 'lat' in query) {
                            if (query.lon === undefined || query.lat === undefined || query.lon.length === 0 || query.lat.length === 0) { res.status(400).json({ type: 'bad_request', message: 'The request query params "lat" and/or "lon" are invalid' }); return }

                            return {
                                by: 'Coordinates',
                                coordinates: { lat: Number(query.lat), lon: Number(query.lon) }
                            }
                        } else if ('cityName' in query) {
                            if (query.cityName.length === 0) { res.status(400).json({ type: 'bad_request', message: 'The request query param "cityName" is invalid' }); return }
                            return { by: 'City Name', cityName: query.cityName }
                        } else if ('cityId' in query) {
                            if (query.cityId.length === 0) { res.status(400).json({ type: 'bad_request', message: 'The request query param "cityId" is invalid' }); return }
                            return { by: 'City ID', cityId: query.cityId }
                        } else if ('zip' in query) {
                            if (query.zip.length === 0) { res.status(400).json({ type: 'bad_request', message: 'The request query param "zip" is invalid' }); return }
                            return { by: 'ZIP Code', zip: query.zip }
                        } else {
                            res.status(400).json({ type: 'bad_request', message: 'The request does not include any search criteria' });
                            return;
                        }
                    })()

                    if (!options) { return }
                    const response = await this.future(options, { start: request.fromTime, end: request.toTime });
                    for (const item of response.data) {
                        item.weather.icon = this.#_Base_URL.icons.replace('<=iconCode=>', item.weather.icon);
                    }

                    return res.json({ type: 'success', weather: response.data });
                }
            } catch (error) {
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

export default new Weatherbit();

/**
 * @typedef {object} TimePeriod
 * @prop {Date} start The starting date
 * @prop {Date} end The ending date
 */
/**@typedef {'Metric'|'Scientific'|'Imperial'} MeasurementSystem */

/**
 * @typedef {object} FutureByCoordinates
 * @prop {'Coordinates'} by Specify by what should the forecase be retrieved
 * @prop {Coordinates} coordinates
 */

/**
 * @typedef {object} FutureByCityName
 * @prop {'City Name'} by Specify by what should the forecase be retrieved
 * @prop {string} cityName
 */

/**
 * @typedef {object} FutureByCityId
 * @prop {'City ID'} by Specify by what should the forecase be retrieved
 * @prop {string} cityId
 */

/**
 * @typedef {object} FutureByZIP
 * @prop {'ZIP Code'} by Specify by what should the forecase be retrieved
 * @prop {string} zip
 */

/**
 * @typedef {object} Coordinates
 * @prop {number} lon The longitude coordinate
 * @prop {number} lat The latitude coordinate
 */

/**
 * @typedef {object} CurrentWeatherResponse
 * @prop {WeatherData[]} data
 * @prop {number} count The number of results
 */

/**
 * @typedef {Object} FutureWeatherResponse
 * @property {string} timezone - Timezone of the location.
 * @property {string} state_code - State code.
 * @property {number} lat - Latitude.
 * @property {number} lon - Longitude.
 * @property {string} country_code - Country code.
 * @property {string} station_id - Station identifier.
 * @property {string[]} sources - Array of data sources.
 * @property {WeatherData[]} data - Array of weather data objects.
 * @property {string} city_name - City name.
 * @property {string} city_id - City identifier.
 */


/**
 * @typedef {Object} WeatherData
 * @property {string} wind_cdir - Wind direction abbreviation.
 * @property {number} rh - Relative humidity.
 * @property {string} pod - Part of the day ('d' for day, 'n' for night).
 * @property {number} lon - Longitude.
 * @property {number} pres - Pressure in hPa.
 * @property {string} timezone - Timezone.
 * @property {string} ob_time - Observation time in "YYYY-MM-DD HH:mm" format.
 * @property {string} country_code - Country code.
 * @property {number} clouds - Cloud coverage in percentage.
 * @property {number} vis - Visibility in kilometers.
 * @property {number} wind_spd - Wind speed in meters per second.
 * @property {number} gust - Wind gust speed in meters per second.
 * @property {string} wind_cdir_full - Full wind direction.
 * @property {number} app_temp - Apparent temperature in Celsius.
 * @property {string} state_code - State code.
 * @property {number} ts - Timestamp.
 * @property {number} h_angle - Solar hour angle.
 * @property {number} dewpt - Dew point in Celsius.
 * @property {Object} weather - Weather details.
 * @property {string} weather.icon - Weather icon code.
 * @property {number} weather.code - Weather code.
 * @property {string} weather.description - Weather description.
 * @property {number} uv - UV index.
 * @property {number} aqi - Air Quality Index.
 * @property {string} station - Station identifier.
 * @property {string[]} sources - Data sources.
 * @property {number} wind_dir - Wind direction in degrees.
 * @property {number} elev_angle - Elevation angle of the sun.
 * @property {string} datetime - Date and time in "YYYY-MM-DD:HH" format.
 * @property {number} precip - Precipitation in millimeters.
 * @property {number} ghi - Global Horizontal Irradiance in W/m².
 * @property {number} dni - Direct Normal Irradiance in W/m².
 * @property {number} dhi - Diffuse Horizontal Irradiance in W/m².
 * @property {number} solar_rad - Solar radiation in W/m².
 * @property {string} city_name - City name.
 * @property {string} sunrise - Sunrise time in "HH:mm" format.
 * @property {string} sunset - Sunset time in "HH:mm" format.
 * @property {number} temp - Temperature in Celsius.
 * @property {number} lat - Latitude.
 * @property {number} slp - Sea level pressure in hPa.
 */
