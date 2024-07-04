class MultiStateBox {
    /**@type {HTMLDivElement} */
    #_element;
    /**@type {Record<string, HTMLElement>} */
    #_states = {};
    /**@type {string} */
    #_active = null;

    /**
     * 
     * @param {string} id The box ID
     */
    constructor(id) {
        if (typeof id !== 'string') { throw new TypeError(`The ID provided to the multistate box should be a string, instead got ${typeof id}`) }
        const ele = document.getElementById(id);
        if (!ele) { throw new Error(`The provided ID (#${id}) doesn't belong to any element in the DOM`) }
        if (ele.nodeName !== 'DIV') { throw new TypeError(`The provided ID (#${id}) doesn't belong to a "div" element`) }
        this.#_element = ele;

        const sections = Array.from(ele.children).filter(i => i.nodeName === 'SECTION');
        if (sections.filter(i => i.hasAttribute('id')).length !== sections.length) { throw new Error(`Some of the MultiStateBox (#${id}) sections don't have IDs assigned to them`) }

        for (const section of sections) {
            this.#_states[section.id] = section;
            if (section.hasAttribute('active')) {
                if (this.#_active === null) {
                    this.#_active = section.id;
                } else {
                    throw new Error(`Only one state of the MultiStateBox can be active at a given time. At least ${this.#_active} and ${section.id} are active`);
                }
            }
        }
    }

    get element() { return this.#_element }
    get states() { return Object.keys(this.#_states) }
    get currentState() { return this.#_states[this.#_active] }

    /**
     * Change the current state to the one of the given ID
     * @param {string} id The state ID to change to
     */
    async changeState(id) {
        try {
            if (typeof id !== 'string') { throw new TypeError(`The changeState expects a string ID to be passed, instead got ${typeof id}`) }
            if (!this.states.includes(id)) { throw new Error(`No state was found with the given ID ${id}`) }
            if (id === this.#_active) { return Promise.resolve() }

            this.#_states[this.#_active].removeAttribute('active');
            this.#_states[id].setAttribute('active', '');
            this.#_active = id;
            
            return Promise.resolve();
        } catch (error) {
            if (error instanceof Error) { error.message = `MultiStateBox #${this.#_element.id} (changeState) Error: ${error.message}` }
            return Promise.reject(error);
        }
    }
}

export default MultiStateBox;
