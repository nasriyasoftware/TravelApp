import path from 'path';
import fs from 'fs';
import express from 'express';

/**An array of the defined lightboxes and their assets */
const lightboxes = [{
    _id: 'destinations',
    html: path.resolve('src/server/lightbox/destinations/index.html'),
    js: path.resolve('src/server/lightbox/destinations/script.js')
},
{
    _id: 'prompt',
    html: path.resolve('src/server/lightbox/prompt/index.html'),
    js: path.resolve('src/server/lightbox/prompt/script.js')
}]

/**Predefined responses */
const responses = {
    /**
     * @param {express.Response} res 
     * @param {string} [message] 
     */
    notFound: (res, message = 'The resource you\'re trying to access was not found') => {
        return res.status(404).json({ code: 404, status: 'not_found', message });
    },
    /**
     * @param {express.Response} res 
     * @param {string} [message] 
     */
    badRequest: (res, message = `Please make sure you make a good request that complies to the API endpoint's rules`) => {
        return res.status(400).json({ code: 400, status: 'bad_request', message });
    }
}

/**
 * Get the content of a file in a `UTF-8` encoding
 * @param {string} path The path to the file
 * @returns {string}
 */
function readFileSync(path) {
    return fs.readFileSync(path, { encoding: 'utf-8' })
}

const henlders = {
    all: {
        /**
         * @param {express.Request} req 
         * @param {express.Response} res 
         * @param {Function} next 
         */
        v1: (req, res, next) => {
            try {
                // Return the IDs of the defined lightboxes
                return res.json({ status: 'success', ids: lightboxes.map(i => i._id) })
            } catch (error) {
                return res.status(500).json({
                    code: 500,
                    status: 'server_error',
                    message: error instanceof Error ? error.message : error,
                    stack: error instanceof Error ? error.stack : undefined
                })
            }
        }
    },
    specific: {
        /**
         * @param {express.Request} req 
         * @param {express.Response} res 
         * @param {Function} next 
         */
        v1: (req, res, next) => {
            const lightbox_id = req.params.id;

            try {
                const lightbox = lightboxes.find(i => i._id === lightbox_id);
                if (!lightbox) { return responses.notFound(res, `No lightbox matched your provided ID: ${lightbox_id}`) }
                
                /**The lightbox data object */
                const data = {
                    _id: lightbox_id,
                    files: []
                }
                
                if (lightbox.html) {
                    data.files.push({ type: 'html', content: readFileSync(lightbox.html) })
                }

                if (lightbox.js) {
                    data.files.push({ type: 'js', content: readFileSync(lightbox.js) })
                }

                if (lightbox.css) {
                    data.files.push({ type: 'css', content: readFileSync(lightbox.css) })
                }

                return res.json(data);
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

export default henlders;