/**
 * @typedef {object} LightboxRecord
 * @prop {string} _name The lightbox name to be called from the client
 * @prop {string} html The HTML content
 * @prop {Function} handler The JavaScript file
 * @prop {string} [css] The CSS content
 */

/**
 * @typedef {object} TravelPlanOptions
 * @prop {string} [_id]
 * @prop {string} title
 * @prop {GeoName[]} destinations
 * @prop {TimePeriod} period
 * @prop {Date|string} [_createdAt]
 */

/**
 * @typedef {object} Destination
 * @prop {string} _id
 * @prop {GeoName} geo The geo location data of the destination
 * @prop {TimePeriod} period The period you'll be in this destination
 * @prop {WeatherData[]} weather
 * @prop {Date} lastUpdate
 */

/**
 * @typedef {Object} GeoName
 * @property {string} adminCode1 The administrative code of the region.
 * @property {string} lng The longitude of the location.
 * @property {number} geonameId The unique identifier for the geographical name.
 * @property {string} toponymName The toponym name of the location.
 * @property {string} countryId The unique identifier for the country.
 * @property {string} fcl The feature class of the location.
 * @property {number} population The population of the location.
 * @property {string} countryCode The ISO 3166-1 alpha-2 country code.
 * @property {string} name The name of the location.
 * @property {string} fclName The full name of the feature class.
 * @property {AdminCodes1} adminCodes1 An object containing administrative codes.
 * @property {string} countryName The name of the country.
 * @property {string} fcodeName The full name of the feature code.
 * @property {string} adminName1 The name of the administrative region.
 * @property {string} lat The latitude of the location.
 * @property {string} fcode The feature code of the location.
 */

/**
 * @typedef {Object} AdminCodes1
 * @property {string} ISO3166_2 - The ISO 3166-2 code for the administrative region.
 */

/**
 * @typedef {object} TimePeriod
 * @prop {Date|string} start The starting date
 * @prop {Date|string} end The ending date
 */

/**
 * @typedef {(data?: Record<string, any>, close: Function) => void} OnLightboxOpen
 */

/**
 * @typedef {object} LightboxOpenOptions
 * @prop {object} [src] The code src
 * @prop {string} [src.html] The `src` of the HTML content
 * @prop {string} [src.js] The `src` of the JavaScript content
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

/**
 * @typedef {object} Coordinates
 * @prop {number} lon The longitude coordinate
 * @prop {number} lat The latitude coordinate
 */