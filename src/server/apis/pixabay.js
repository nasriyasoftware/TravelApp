import express from 'express';
import axios from "axios";

class Pixabay {
    #_Base_Url = 'https://pixabay.com/api/';
    #_API_Key = process.env.PIXABAY_API_KEY;

    /**
     * Search Images
     * @param {string} searchTerm A search term no longer than 100 characters
     * @returns {Promise<ImageSearchResponse>}
     */
    async searchImages(searchTerm) {
        try {
            if (searchTerm === undefined) { throw new SyntaxError(`The "searchTerm" is missing`) }
            if (typeof searchTerm !== 'string') { throw new TypeError(`The "searchTerm" can only be string, instead got ${typeof searchTerm}`) }
            if (searchTerm.length > 100) { throw new RangeError(`The "searchTerm" cannot be longer than 100 characters`) }

            const httpRes = await axios.get(`${this.#_Base_Url}?key=${this.#_API_Key}&q=${encodeURIComponent(searchTerm)}`);
            if (httpRes.status !== 200) { throw new Error(`Unexpected API response recieved. The API responded with a status of (${httpRes.status})`) }

            return httpRes.data;
        } catch (error) {
            if (error instanceof Error) { error.message = `Pixabay API (searchImages) Error: ${error.message}` }
            return Promise.reject(error);
        }
    }

    /**
     * Search videos
     * @param {string} searchTerm A search term no longer than 100 characters
     * @returns {Promise<VideoSearchResponse>}
     */
    async searchVideos(searchTerm) {
        try {
            if (searchTerm === undefined) { throw new SyntaxError(`The "searchTerm" is missing`) }
            if (typeof searchTerm !== 'string') { throw new TypeError(`The "searchTerm" can only be string, instead got ${typeof searchTerm}`) }
            if (searchTerm.length > 100) { throw new RangeError(`The "searchTerm" cannot be longer than 100 characters`) }

            const httpRes = await axios.get(`${this.#_Base_Url}/videos?key=${this.#_API_Key}&q=${encodeURIComponent(searchTerm)}`);
            if (httpRes.status !== 200) { throw new Error(`Unexpected API response recieved. The API responded with a status of (${httpRes.status})`) }

            return httpRes.data;
        } catch (error) {
            if (error instanceof Error) { error.message = `Pixabay API (searchVideos) Error: ${error.message}` }
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
                const query = req.query.q; // Read the query
                if (!query || query.length === 0) { return res.status(400).json({ code: 400, status: 'bad_request', message: 'The search query "q" is missing or empty' }) }
                const results = await this.searchImages(query);

                if (results.hits.length > 0) {
                    // Get a random picure from the matching data
                    const hit = results.hits[Math.floor(Math.random() * results.hits.length)];
                    return res.json({ code: 200, status: 'ok', src: hit.largeImageURL })
                } else {
                    return res.status(404).json({ code: 404, status: 'not_found', message: 'No pictures matched the search criteria' })
                }
            } catch (error) {
                console.error(error)
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

export default new Pixabay();

/**
 * @typedef {Object} Video
 * @property {string} url - The URL of the video.
 * @property {number} width - The width of the video.
 * @property {number} height - The height of the video.
 * @property {number} size - The size of the video in bytes.
 * @property {string} thumbnail - The URL of the video thumbnail.
 */

/**
 * @typedef {Object} VideoHit
 * @property {number} id - The ID of the video.
 * @property {string} pageURL - The URL of the video page.
 * @property {string} type - The type of video (e.g., "film").
 * @property {string} tags - A comma-separated list of tags associated with the video.
 * @property {number} duration - The duration of the video in seconds.
 * @property {Object} videos - The different video formats available.
 * @property {Video} videos.large - The large version of the video.
 * @property {Video} videos.medium - The medium version of the video.
 * @property {Video} videos.small - The small version of the video.
 * @property {Video} videos.tiny - The tiny version of the video.
 * @property {number} views - The number of views of the video.
 * @property {number} downloads - The number of downloads of the video.
 * @property {number} likes - The number of likes of the video.
 * @property {number} comments - The number of comments on the video.
 * @property {number} user_id - The ID of the user who uploaded the video.
 * @property {string} user - The username of the user who uploaded the video.
 * @property {string} userImageURL - The URL of the user's profile image.
 */

/**
 * @typedef {Object} VideoSearchResponse
 * @property {number} total - The total number of videos found.
 * @property {number} totalHits - The total number of videos in the current search result.
 * @property {VideoHit[]} hits - An array of video hit objects.
 */

/**
 * @typedef {Object} ImageHit
 * @property {number} id - The ID of the image.
 * @property {string} pageURL - The URL of the image page.
 * @property {string} type - The type of image (e.g., "photo").
 * @property {string} tags - A comma-separated list of tags associated with the image.
 * @property {string} previewURL - The URL of the preview image.
 * @property {number} previewWidth - The width of the preview image.
 * @property {number} previewHeight - The height of the preview image.
 * @property {string} webformatURL - The URL of the web format image.
 * @property {number} webformatWidth - The width of the web format image.
 * @property {number} webformatHeight - The height of the web format image.
 * @property {string} largeImageURL - The URL of the large image.
 * @property {string} fullHDURL - The URL of the full HD image.
 * @property {string} imageURL - The URL of the original image.
 * @property {number} imageWidth - The width of the original image.
 * @property {number} imageHeight - The height of the original image.
 * @property {number} imageSize - The size of the original image in bytes.
 * @property {number} views - The number of views of the image.
 * @property {number} downloads - The number of downloads of the image.
 * @property {number} likes - The number of likes of the image.
 * @property {number} comments - The number of comments on the image.
 * @property {number} user_id - The ID of the user who uploaded the image.
 * @property {string} user - The username of the user who uploaded the image.
 * @property {string} userImageURL - The URL of the user's profile image.
 */

/**
 * @typedef {Object} ImageSearchResponse
 * @property {number} total - The total number of images found.
 * @property {number} totalHits - The total number of images in the current search result.
 * @property {ImageHit[]} hits - An array of image hit objects.
 */


/**
 * @typedef {Object} SearchImageOptions
 * @property {string} key - Your API key (required).
 * @property {string} [q] - A URL encoded search term. If omitted, all images are returned. This value may not exceed 100 characters. Example: "yellow+flower".
 * @property {string} [lang="en"] - Language code of the language to be searched in. Accepted values: "cs", "da", "de", "en", "es", "fr", "id", "it", "hu", "nl", "no", "pl", "pt", "ro", "sk", "fi", "sv", "tr", "vi", "th", "bg", "ru", "el", "ja", "ko", "zh".
 * @property {string} [id] - Retrieve individual images by ID.
 * @property {string} [image_type="all"] - Filter results by image type. Accepted values: "all", "photo", "illustration", "vector".
 * @property {string} [orientation="all"] - Whether an image is wider than it is tall, or taller than it is wide. Accepted values: "all", "horizontal", "vertical".
 * @property {string} [category] - Filter results by category. Accepted values: "backgrounds", "fashion", "nature", "science", "education", "feelings", "health", "people", "religion", "places", "animals", "industry", "computer", "food", "sports", "transportation", "travel", "buildings", "business", "music".
 * @property {number} [min_width=0] - Minimum image width.
 * @property {number} [min_height=0] - Minimum image height.
 * @property {string} [colors] - Filter images by color properties. A comma-separated list of values may be used to select multiple properties. Accepted values: "grayscale", "transparent", "red", "orange", "yellow", "green", "turquoise", "blue", "lilac", "pink", "white", "gray", "black", "brown".
 * @property {boolean} [editors_choice=false] - Select images that have received an Editor's Choice award. Accepted values: "true", "false".
 * @property {boolean} [safesearch=false] - A flag indicating that only images suitable for all ages should be returned. Accepted values: "true", "false".
 * @property {string} [order="popular"] - How the results should be ordered. Accepted values: "popular", "latest".
 * @property {number} [page=1] - Returned search results are paginated. Use this parameter to select the page number.
 * @property {number} [per_page=20] - Determine the number of results per page. Accepted values: 3 - 200.
 * @property {string} [callback] - JSONP callback function name.
 * @property {boolean} [pretty=false] - Indent JSON output. This option should not be used in production. Accepted values: "true", "false".
 */

/**
 * @typedef {Object} SearchVideoOptions
 * @property {string} key - Your API key (required).
 * @property {string} [q] - A URL encoded search term. If omitted, all videos are returned. This value may not exceed 100 characters. Example: "yellow+flower".
 * @property {string} [lang="en"] - Language code of the language to be searched in. Accepted values: "cs", "da", "de", "en", "es", "fr", "id", "it", "hu", "nl", "no", "pl", "pt", "ro", "sk", "fi", "sv", "tr", "vi", "th", "bg", "ru", "el", "ja", "ko", "zh".
 * @property {string} [id] - Retrieve individual videos by ID.
 * @property {string} [video_type="all"] - Filter results by video type. Accepted values: "all", "film", "animation".
 * @property {string} [category] - Filter results by category. Accepted values: "backgrounds", "fashion", "nature", "science", "education", "feelings", "health", "people", "religion", "places", "animals", "industry", "computer", "food", "sports", "transportation", "travel", "buildings", "business", "music".
 * @property {number} [min_width=0] - Minimum video width.
 * @property {number} [min_height=0] - Minimum video height.
 * @property {boolean} [editors_choice=false] - Select videos that have received an Editor's Choice award. Accepted values: "true", "false".
 * @property {boolean} [safesearch=false] - A flag indicating that only videos suitable for all ages should be returned. Accepted values: "true", "false".
 * @property {string} [order="popular"] - How the results should be ordered. Accepted values: "popular", "latest".
 * @property {number} [page=1] - Returned search results are paginated. Use this parameter to select the page number.
 * @property {number} [per_page=20] - Determine the number of results per page. Accepted values: 3 - 200.
 * @property {string} [callback] - JSONP callback function name.
 * @property {boolean} [pretty=false] - Indent JSON output. This option should not be used in production. Accepted values: "true", "false".
 */
