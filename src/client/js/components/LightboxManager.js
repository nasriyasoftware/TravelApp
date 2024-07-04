import '../types.js';

const svgParser = new DOMParser();

class Lightbox {
    static #_baseUrl = `/api/lightbox`;
    static #_initialized = false;
    /**
     * An array of IDs for lighboxes on the server
     * @type {string[]}
     */
    static #_lightbox_ids = [];

    /**
     * The Lightbox element
     * @type {HTMLDivElement}
     */
    static #_element;

    /**
     * The cached Lightboxes and their data
     * @type {Record<string, LightboxRecord>}
     */
    static #_lightboxes = {}

    static #_elements = {
        closeIcon: () => {
            const container = document.createElement('div');
            container.id = 'lightbox-close-icon';
            container.classList.add('closeIcon');

            const svg = svgParser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M6.4,15,10,11.4,13.6,15,15,13.6,11.4,10,15,6.4,13.6,5,10,8.6,6.4,5,5,6.4,8.6,10,5,13.6ZM10,20a9.68,9.68,0,0,1-3.9-.79A10,10,0,0,1,.79,13.9,9.68,9.68,0,0,1,0,10,9.68,9.68,0,0,1,.79,6.1,10,10,0,0,1,6.1.79,9.68,9.68,0,0,1,10,0a9.68,9.68,0,0,1,3.9.79A10,10,0,0,1,19.21,6.1,9.68,9.68,0,0,1,20,10a9.68,9.68,0,0,1-.79,3.9,9.87,9.87,0,0,1-5.31,5.31A9.68,9.68,0,0,1,10,20Z" /></svg>`, "image/svg+xml").documentElement;
            container.appendChild(svg);
            return container;
        },
        container: () => {
            const container = document.createElement('div');
            container.classList.add('lightbox-content');
            return container;
        }
    }

    static #_updaetContent(content) {
        const container = Array.from(this.#_element.children).find(i => i.classList.contains('lightbox-content'));
        if (!container) { throw new Error(`Unable to update the lightbox content: No content container was found`) }
        container.innerHTML = typeof content === 'string' ? content : '';
    }

    static async #_init() {
        try {
            if (!this.#_initialized) {
                const ele = document.getElementById('lightbox');
                if (ele) {
                    this.#_element = ele;
                } else {
                    this.#_element = document.createElement('div');
                    this.#_element.id = 'lightbox';

                    const frag = document.createDocumentFragment();
                    const closeBtn = this.#_elements.closeIcon();
                    const container = this.#_elements.container();
                    frag.append(closeBtn, container);

                    this.#_element.appendChild(frag);
                    document.body.prepend(this.#_element);
                }

                const httpRes = await fetch(`${this.#_baseUrl}/all`);
                const response = await httpRes.json();
                if (!httpRes.ok) { throw new Error(response.message) }

                this.#_lightbox_ids = response.ids;
            }
        } catch (error) {
            if (error instanceof Error) { error.message = `Lightbox initialization Error: ${error.message}` }
            throw error;
        }
    }

    static async #_fetch(name) {
        try {
            if (name in this.#_lightboxes) { return }

            const httpRes = await fetch(`${this.#_baseUrl}/${name}`);
            const response = await httpRes.json();

            if (httpRes.ok) {
                const htmlFile = response.files.find(i => i.type === 'html');
                const jsFile = response.files.find(i => i.type === 'js');
                const cssFile = response.files.find(i => i.type === 'css');

                const record = {
                    _name: response._id,
                    files: {}
                }

                if (htmlFile && typeof htmlFile.content === 'string' && htmlFile.content) {
                    record.html = htmlFile.content;
                } else {
                    throw new Error(`The lightbox (${name}) does not have any HTML content`);
                }

                if (jsFile && typeof jsFile.content === 'string' && jsFile.content) {
                    const module = new Function('data', 'close', `${jsFile.content}\nreturn handler;`);
                    record.handler = module();
                } else {
                    throw new Error(`The lightbox (${name}) does not have any JavaScript content`);
                }

                if (cssFile) {
                    // I might add CSS capabilities later
                }

                this.#_lightboxes[name] = record;
            } else {
                if (httpRes.status !== 404) { throw response }
            }
        } catch (error) {
            if (error instanceof Error) { error.message = `Unable to fetch lightbox: ${error.message}` }
        }
    }

    /**
     * OPen a lightbox by providing its name
     * @param {string} name The lightbox name (id)
     * @param {*} [data] Pass any data you want to the lightbox
     */
    static async open(name, data) {
        if (!this.#_initialized) { await this.#_init() }
        if (typeof name !== 'string' || name.length === 0) { throw new Error('Unable to open lightbox: The lightbox "open()" method expects a string lightbox name') }
        if (!this.#_lightbox_ids.includes(name)) { throw new Error(`${name} is not a valid lightbox. Please only use a defined lightbox`) }
        
        await this.#_fetch(name);

        return new Promise((resolve, reject) => {
            try {
                const lihgtbox = this.#_lightboxes[name];
                if (!lihgtbox) { throw new Error(`The ${name} lightbox was not found.`) }

                this.#_updaetContent(lihgtbox.html);
                if (!this.#_element.hasAttribute('opened')) { this.#_element.setAttribute('opened', '') }

                const closeFunction = (closeData) => {
                    if (this.#_element.hasAttribute('opened')) { this.#_element.removeAttribute('opened') }
                    this.#_updaetContent();
                    resolve(closeData);
                }

                lihgtbox.handler(data, closeFunction);
            } catch (error) {
                if (error instanceof Error) { error.message = `Unable to open lightbox: ${error.message}` }
                reject(error);
            }
        })
    }
}

export default Lightbox;