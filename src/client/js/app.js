import './types.js';
import MultiStateBox from "./components/MultiStateBox.js";
import TravelPlan from './travel/TravelPlan.js';
import CustomDate from './components/CustomDate.js';
import travelPlansManager from './travel/manager.js';
import lightbox from './components/LightboxManager.js';
import helpers from './helpers.js';

/**SVG UI icons */
export const icons = {
    destinations: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 20"><path d="M8,10a2,2,0,0,0,2-2A2,2,0,0,0,8,6,2,2,0,0,0,6,8a2,2,0,0,0,2,2Zm0,7.35a27.9,27.9,0,0,0,4.53-5.09A7.77,7.77,0,0,0,14,8.2a6,6,0,0,0-1.74-4.46A5.79,5.79,0,0,0,8,2,5.79,5.79,0,0,0,3.74,3.74,6,6,0,0,0,2,8.2a7.71,7.71,0,0,0,1.48,4.06A27.42,27.42,0,0,0,8,17.35ZM8,20a33,33,0,0,1-6-6.36A9.86,9.86,0,0,1,0,8.2a7.71,7.71,0,0,1,2.41-6A8,8,0,0,1,8,0a8,8,0,0,1,5.59,2.23A7.71,7.71,0,0,1,16,8.2a9.86,9.86,0,0,1-2,5.44A33,33,0,0,1,8,20Z" /></svg>`,
    hotel: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 15"><path d="M0,15V0H2V10h8V2h8a3.85,3.85,0,0,1,2.83,1.18A3.84,3.84,0,0,1,22,6v9H20V12H2v3ZM6,9a2.89,2.89,0,0,1-2.12-.87A2.9,2.9,0,0,1,3,6a2.86,2.86,0,0,1,.88-2.12A2.86,2.86,0,0,1,6,3a2.9,2.9,0,0,1,2.13.88A2.89,2.89,0,0,1,9,6,3,3,0,0,1,6,9Zm6,1h8V6a2,2,0,0,0-2-2H12ZM6,7a1,1,0,1,0-.71-.29A1,1,0,0,0,6,7Zm6-3V4Z" /></svg>`,
    flight: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17.43 17.4"><path d="M3.55,13.85.35,12.1l1-1,2.5.35L7.8,7.5,0,3.25l1.4-1.4L11,4.3,14.88.43A1.4,1.4,0,0,1,15.94,0,1.42,1.42,0,0,1,17,.43a1.44,1.44,0,0,1,.43,1.06A1.46,1.46,0,0,1,17,2.55l-3.9,3.9L15.55,16l-1.4,1.4L9.9,9.6,6,13.5,6.35,16l-1,1.05Z" /></svg>`,
    todo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 640"><path d="M0,640V480H160V640Zm240,0V480H800V640ZM0,400V240H160V400Zm240,0V240H800V400ZM0,160V0H160V160Zm240,0V0H800V160Z" /></svg>`,
    closeIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320.591 320.591">
    <path d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"></path>
    <path d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"></path>
    </svg>`
}

class App {
    /**
     * The main container of the app
     * @type {MultiStateBox}
    */
    #_container = new MultiStateBox('app');

    #_states = {
        /**A state that shows a loader when main application requests are processing */
        loader: {
            /**The name (id) of this `MultiStateBox`'s `loader` state */
            stateName: 'loader',
            elements: {
                /**@type {HTMLParagraphElement} */
                message: document.getElementById('appLoaderMsg')
            },
            /**She a useful and descriptive message of what is being processed  */
            showMessage: (message) => {
                const elem = this.#_states.loader.elements.message;
                elem.textContent = message;
                if (elem.hasAttribute('hidden')) { elem.removeAttribute('hidden') }
            },
            /**Hide the loading message */
            hide: () => {
                const elem = this.#_states.loader.elements.message;
                if (!elem.hasAttribute('hidden')) { elem.setAttribute('hidden', '') }
            }
        },
        /**A state for displaying the plans */
        records: {
            /**The name (id) of this `MultiStateBox`'s `records` state */
            stateName: 'records',
            elements: {
                /**@type {HTMLButtonElement} */
                createBtn: document.getElementById('open-createPlanState'),
                content: new MultiStateBox('records-states')
            },
            /**The `records`/`plans` states */
            states: {
                noResults: { stateName: 'no-records-state' },
                results: {
                    stateName: 'records-results-state',
                    elements: {
                        /**@type {HTMLDivElement} */
                        repeater: document.getElementById('records-repeater'),
                    },
                    /**
                     * Create a DOM record from a `TravelPlan` instance
                     * @param {TravelPlan} plan 
                     */
                    createRecord: (plan, expired = false) => {
                        // Create a record
                        const recordEle = document.createElement('div');
                        recordEle.classList.add('record');
                        recordEle.setAttribute('item-id', plan._id);
                        if (expired === true) { recordEle.setAttribute('expired', '') }

                        // Creaet a plan title element
                        const planTitleEle = document.createElement('p');
                        planTitleEle.classList.add('plan-item-name');
                        planTitleEle.textContent = plan.title;
                        recordEle.appendChild(planTitleEle);

                        // Create the metrics container
                        const metricsEle = document.createElement('div');
                        metricsEle.classList.add('metrics');
                        recordEle.appendChild(metricsEle);

                        // append necessary metrics
                        const metricDefinitions = [
                            { name: 'destinations', icon: icons.destinations, required: true },
                            { name: 'hotelReservations', icon: icons.hotel, required: true },
                            { name: 'flights', icon: icons.flight, required: true },
                            { name: 'todos', icon: icons.todo, required: true }
                        ]

                        // Creaet & append the plan metrics
                        for (const metricDefinition of metricDefinitions) {
                            if (metricDefinition.required || plan[metricDefinition.name].length > 0) {
                                const main = document.createElement('div');
                                main.classList.add('metric');
                                metricsEle.appendChild(main);

                                main.appendChild(helpers.createSVG(metricDefinition.icon));
                                const amountEle = document.createElement('p');
                                amountEle.textContent = plan[metricDefinition.name].length || 0;
                                main.appendChild(amountEle);
                            }
                        }

                        // Return the created plan element
                        return recordEle;
                    },
                    /**
                     * Set the plan elements in the DOM
                     * @param {TravelPlan[]} items 
                     */
                    set: (items) => {
                        const { helpers, createRecord, elements } = this.#_states.records.states.results;
                        // Reset the view
                        helpers.removeAll();

                        const now = new Date();
                        /**@type {{ expired: boolean, plan: TravelPlan }[]} */
                        const records = items.map(plan => {
                            return { expired: plan.end < now, plan }
                        })

                        // Sort plans
                        records.sort((planA, planB) => {
                            if (planA.expired && planB.expired) { return 0 }
                            if (planA.expired && !planB.expired) { return 1 }
                            if (!planA.expired && planB.expired) { return -1 }
                        })

                        // A fragment to hold all the plans
                        const frag = document.createDocumentFragment();
                        for (const record of records) {
                            const recordEle = createRecord(record.plan, record.expired);
                            frag.appendChild(recordEle);
                        }

                        // Append the items to the repeater
                        elements.repeater.appendChild(frag);
                    },
                    helpers: {
                        /**Remove all `plans` from the DOM */
                        removeAll: () => {
                            const { elements } = this.#_states.records.states.results;
                            elements.repeater.innerHTML = '';
                        }
                    }
                }
            },
            /**Initialize the `plans` records */
            initialize: () => {
                // Records state
                const records = this.#_states.records;
                const { createBtn, content } = this.#_states.records.elements;

                // Add a click event listener to the `createBtn`
                createBtn.addEventListener('click', () => {
                    this.#_container.changeState('create-new-plan').then(() => {
                        this.#_states.createPlan.elements.planTitle.focus();
                    });
                })

                // Check if the `travelPlansManager` was able to find data from the local storage
                if (travelPlansManager.records.length > 0) {
                    // Use the data from the local storage to render the plans
                    records.states.results.set(travelPlansManager.records);
                    content.changeState(records.states.results.stateName);
                }

                /**
                 * Add a `click` event listener to the repeater.
                 * I could've created a separate event listern for each and every element,
                 * and while it's okay to do that for a handful of elements, this can overwhelm
                 * the page if lots of items are rendered.
                 */

                records.states.results.elements.repeater.addEventListener('click', (event) => {
                    /**
                     * The clicked element
                     * @type {HTMLDivElement}
                    */
                    const target = event.target;

                    /**
                     * The context (item) that the click was originated from.
                     * @type {HTMLDivElement}
                     */
                    const context = (() => {
                        let currentTarget = target;
                        while (currentTarget.parentElement) {
                            if (currentTarget.hasAttribute('item-id')) {
                                return currentTarget;
                            } else {
                                currentTarget = currentTarget.parentElement;
                            }
                        }
                    })()

                    /**The context (item) ID */
                    const contextId = context.getAttribute('item-id');
                    const plan = travelPlansManager.records.find(i => i._id === contextId);
                    if (plan) { this.#_states.planItem.open(plan) }
                })
            }
        },
        /**A state with a form to allow users to create a new plan */
        createPlan: {
            /**The name (id) of this `MultiStateBox`'s `create-new-plan` state */
            stateName: 'create-new-plan',
            elements: {
                /**@type {HTMLButtonElement} */
                cancel: document.getElementById('cancelCreatingPlan'),
                /**@type {HTMLInputElement} */
                planTitle: document.getElementById('create-plan-name-input'),
                /**@type {HTMLButtonElement} */
                createBtn: document.getElementById('createPlan'),
                /**@type {HTMLInputElement} */
                startDate: document.getElementById('plan-startDate-input'),
                /**@type {HTMLInputElement} */
                endDate: document.getElementById('plan-endDate-input')
            },
            helpers: {
                /**Validators for input fields */
                validators: {
                    planTitle: {
                        /**
                         * Validate the pla title
                         * @param {string} [planTitle] The title value
                         * @returns { {valid: true} | { valid: false, message: string, indicateError: boolean } }
                         */
                        validate: (planTitle) => {
                            if (planTitle === undefined) { planTitle = this.#_states.createPlan.elements.planTitle.value }
                            const invalid = { valid: false, message: '', indicateError: true }

                            if (typeof planTitle !== 'string') {
                                invalid.message = `The plan title should be a string`;
                                return invalid;
                            }

                            if (planTitle.length === 0) {
                                invalid.indicateError = false;
                                return invalid;
                            }

                            if (planTitle.length < 5) {
                                invalid.message = `The plan title is too short. ${5 - planTitle.length} chars left.`;
                                return invalid;
                            }

                            return { valid: true }
                        },
                        customValidation: (planTitle) => {
                            const { validate, resetValidityIndication, reject } = this.#_states.createPlan.helpers.validators.planTitle
                            const validity = validate(planTitle);

                            if (validity.valid) {
                                resetValidityIndication();
                            } else {
                                if (validity.indicateError) {
                                    reject(validity.message);
                                } else {
                                    resetValidityIndication();
                                }
                            }
                        },
                        resetValidityIndication: () => {
                            helpers.resetValidityIndication(this.#_states.createPlan.elements.planTitle);
                        },
                        reject: (msg) => {
                            helpers.invalidateInput(this.#_states.createPlan.elements.planTitle, msg);
                        }
                    },
                    startDate: {
                        /**
                         * @param {string} [startDateStr] 
                         * @returns { {valid: true} | { valid: false, message: string, indicateError: boolean } }
                         */
                        validate: (startDateStr) => {
                            if (startDateStr === undefined) { startDateStr = this.#_states.createPlan.elements.startDate.value }
                            const invalid = { valid: false, message: '', indicateError: true }

                            if (startDateStr.length === 0) {
                                invalid.indicateError = false;
                                return invalid;
                            }

                            const endDate = this.#_states.createPlan.elements.endDate;
                            endDate.disabled = true;

                            if (!helpers.isRealDate(startDateStr)) {
                                invalid.message = `The provided start date value is not a valid Date`;
                                return invalid;
                            }

                            const startDate = startDateStr instanceof Date ? startDateStr : new Date(startDateStr);
                            const now = new Date();

                            if (new CustomDate(now).toISODateString() === new CustomDate(startDate).toISODateString()) {
                                invalid.message = `The leaving date cannot be today`;
                                return invalid;
                            }

                            if (startDate < now) {
                                invalid.message = `The leaving date cannot be in the past`;
                                return invalid;
                            }

                            endDate.disabled = false;
                            endDate.focus()
                            return { valid: true }
                        },
                        resetValidityIndication: () => {
                            helpers.resetValidityIndication(this.#_states.createPlan.elements.startDate);
                        },
                        reject: (msg) => {
                            helpers.invalidateInput(this.#_states.createPlan.elements.startDate, msg);
                        }
                    },
                    endDate: {
                        /**
                         * @param {string} [endDateStr] 
                         * @returns { {valid: true} | { valid: false, message: string, indicateError: boolean } }
                         */
                        validate: (endDateStr) => {
                            if (endDateStr === undefined) { endDateStr = this.#_states.createPlan.elements.endDate.value }
                            const invalid = { valid: false, message: '', indicateError: true }

                            if (endDateStr.length === 0) {
                                invalid.indicateError = false;
                                return invalid;
                            }

                            if (!helpers.isRealDate(endDateStr)) {
                                invalid.message = `The provided end date value is not a valid Date`;
                                return invalid;
                            }

                            const endDate = endDateStr instanceof Date ? endDateStr : new Date(endDateStr);
                            const startDateStr = this.#_states.createPlan.elements.startDate.value;
                            const now = new Date();

                            if (!helpers.isRealDate(startDateStr)) {
                                invalid.message = `Select the leaving date first`;
                                return invalid;
                            }

                            if (new CustomDate(now).toISODateString() === startDateStr) {
                                invalid.message = `The leaving date cannot be today`;
                                return invalid;
                            }

                            if (endDate < now) {
                                invalid.message = `The returning date cannot be in the past`;
                                return invalid;
                            }

                            const startDate = new Date(startDateStr);
                            if (endDate <= startDate) {
                                invalid.message = `The returning date cannot be after or on the leaving date`;
                                return invalid;
                            }

                            return { valid: true }
                        },
                        resetValidityIndication: () => {
                            helpers.resetValidityIndication(this.#_states.createPlan.elements.endDate);
                        },
                        reject: (msg) => {
                            helpers.invalidateInput(this.#_states.createPlan.elements.endDate, msg);
                        }
                    }
                },
                /**
                 * Valdiate the form
                 * @returns {boolean} Whether the form is valid or not
                */
                validateState: () => {
                    const validators = this.#_states.createPlan.helpers.validators;
                    const validity = {
                        planTitle: validators.planTitle.validate().valid,
                        startDate: validators.startDate.validate().valid,
                        endDate: validators.endDate.validate().valid
                    }

                    let valid = true;
                    for (const input in validity) {
                        if (validity[input] === false) { valid = false; break; }
                    }

                    const btn = this.#_states.createPlan.elements.createBtn;
                    if (valid) {
                        if (btn.disabled) { btn.disabled = false }
                    } else {
                        if (!btn.disabled) { btn.disabled = true }
                    }

                    return valid;
                },
                /**
                 * A custom validation handler
                 * @param {string} value A value to validate
                 * @param {'planTitle'|'startDate'|'endDate'} section 
                 */
                customValidation: (value, section) => {
                    const validateState = this.#_states.createPlan.helpers.validateState;
                    const { validate, resetValidityIndication, reject } = this.#_states.createPlan.helpers.validators[section];
                    const validity = validate(value);

                    if (validity.valid) {
                        resetValidityIndication();
                    } else {
                        if (validity.indicateError) {
                            reject(validity.message);
                        } else {
                            resetValidityIndication();
                        }
                    }

                    validateState();
                },
                /**Reset the form */
                reset: () => {
                    const { planTitle, startDate, endDate, createBtn } = this.#_states.createPlan.elements;

                    planTitle.value = startDate.value = endDate.value = '';
                    helpers.resetValidityIndication(planTitle);
                    helpers.resetValidityIndication(startDate);
                    helpers.resetValidityIndication(endDate);

                    if (!createBtn.disabled) { createBtn.disabled = true }
                }
            },
            /**Initialize the `create-new-plan` state */
            initialize: () => {
                // Add Plan State
                const { cancel, createBtn, planTitle, startDate, endDate } = this.#_states.createPlan.elements;
                const { reset, customValidation } = this.#_states.createPlan.helpers;

                // Define event listeners and handlers
                cancel.addEventListener('click', () => {
                    this.#_container.changeState(this.#_states.records.stateName);
                    reset();
                })

                planTitle.addEventListener('input', (event) => {
                    customValidation(event.target.value, 'planTitle');
                })

                startDate.addEventListener('change', (event) => {
                    try {
                        customValidation(event.target.value, 'startDate');
                    } catch (error) {
                        console.error(error);
                    }
                })

                endDate.addEventListener('change', (event) => {
                    try {
                        customValidation(event.target.value, 'endDate');
                    } catch (error) {
                        console.error(error);
                    }
                })

                createBtn.addEventListener('click', async () => {
                    // If the state validation is not valid, return
                    if (!this.#_states.createPlan.helpers.validateState()) { return }

                    const { planTitle, startDate, endDate } = this.#_states.createPlan.elements;

                    /**
                     * A created `TravelPlan` record 
                     * @type {TravelPlan}
                     */
                    const plan = travelPlansManager.createPlan(planTitle.value, { start: new Date(startDate.value), end: new Date(endDate.value) });

                    const records = this.#_states.records;
                    const { createRecord, elements, stateName } = records.states.results;

                    const planRecord = createRecord(plan);  // Create a DOM element
                    elements.repeater.prepend(planRecord);  // Add the element to the DOM

                    // Change the records' state to the `results` state the current state is not the `results` state
                    if (records.elements.content.currentState.id !== stateName) { records.elements.content.changeState(stateName) }

                    // After creating the plan, head back to the main screen
                    this.#_container.changeState(this.#_states.records.stateName);
                    // Reset the form
                    reset();
                })
            }
        },
        /**A state to display the details of a selected plan */
        planItem: {
            /**The name (id) of this `MultiStateBox`'s `plan-item` state */
            stateName: 'plan-item',
            /**The title's max characters limit to avoid overflow issues */
            titleMaxChar: 35,
            /**@type {TravelPlan} */
            selectedItem: null,
            elements: {
                /**@type {HTMLButtonElement} */
                removeBtn: document.getElementById('delete-plan'),
                /**@type {HTMLButtonElement} */
                backBtn: document.getElementById('backToRecordsFromPlanItem'),
                /**@type {HTMLImageElement} */
                planImg: document.getElementById('plan-item-img'),
                /**@type {HTMLHeadingElement} */
                title: document.getElementById('plan-item-title'),
                /**@type {HTMLDivElement} */
                editTitleIcon: document.getElementById('edit-plan-title-icon'),
                /**@type {HTMLParagraphElement} */
                titleErrMsg: document.getElementById('selected-plan-name-input_err_msg'),
                /**@type {HTMLInputElement} */
                titleInput: document.getElementById('selected-plan-name-input'),
                /**@type {HTMLParagraphElement} */
                startDate: document.getElementById('plan-item-startDate'),
                /**@type {HTMLParagraphElement} */
                endDate: document.getElementById('plan-item-endDate'),
                metrics: {
                    /**@type {HTMLParagraphElement} */
                    destinations: document.getElementById('selected-plan-destinations-number'),
                    /**@type {HTMLParagraphElement} */
                    flights: document.getElementById('selected-plan-flights-number'),
                    /**@type {HTMLParagraphElement} */
                    hotels: document.getElementById('selected-plan-hotels-number'),
                    /**@type {HTMLParagraphElement} */
                    todos: document.getElementById('selected-plan-todos-number'),
                }
            },
            /**The selected plan sections */
            sections: {
                destinations: {
                    elements: {
                        /**@type {HTMLButtonElement} */
                        actionBtn: document.getElementById('destinations-action-btn'),
                        /**@type {MultiStateBox} */
                        content: new MultiStateBox('selected-plan-destinations-box'),
                    },
                    states: {
                        noResults: { stateName: 'no-destinations-state' },
                        results: { stateName: 'all-destination-state' },
                        loading: { stateName: `destinations-loader` }
                    },
                    /**Reset the `destinations`' view */
                    reset: () => {
                        const { elements, states } = this.#_states.planItem.sections.destinations;
                        elements.content.changeState(states.noResults.stateName);
                    },
                    /**Initialize the destinations section */
                    initialize: () => {
                        const client = this.#_states.planItem.sections.destinations;
                        const { actionBtn, content } = client.elements;

                        // Define an event handler and attach it to the `click` event listeners of the destinations' action button
                        actionBtn.addEventListener('click', async () => {
                            /**
                             * Open the `destinations` lightbox and wait for the results from the form
                             * @type {{ ok: false }|{ ok: true, data: { destination: string, arriveDate: Date, leaveDate: Date } }}
                             */
                            const response = await lightbox.open('destinations', this.#_states.planItem.selectedItem);

                            // Check if the form (from the lightbox) data is ok/valid or not
                            if (response.ok) {
                                const client = this.#_states.planItem.sections.destinations;
                                // Prepare for processing by changing to the loading screen
                                client.elements.content.changeState(client.states.loading.stateName);

                                // Extract the form data
                                const { destination, arriveDate, leaveDate } = response.data;

                                // Recreate the data object in a different format
                                const data = { destination, period: { start: arriveDate, end: leaveDate } }

                                // Request updating the plan
                                await this.#_states.planItem.update({ destinations: { type: 'add', item: data } })

                                // Change the state to show the results
                                client.elements.content.changeState(client.states.results.stateName);
                            }
                        })

                        // Define an event handler and attach it to the `click` event listeners of the destinations' repeater/state
                        content.element.addEventListener('click', async (event) => {
                            /**
                             * The item that was clicked
                             * @type {HTMLDivElement}
                             */
                            const target = event.target;

                            /**
                             * The context (item) that the clicked item belongs to
                             * @type {HTMLDivElement}
                             */
                            const context = (() => {
                                let currentTarget = target;
                                while (currentTarget.parentElement) {
                                    if (currentTarget.hasAttribute('item-id')) {
                                        return currentTarget;
                                    } else {
                                        currentTarget = currentTarget.parentElement;
                                    }
                                }
                            })();

                            /**
                             * Check if the clicked item is the `delete/remove` icon.
                             * @type {boolean}
                             */
                            const isCloseIcon = (() => {
                                let currentElem = target;
                                while (currentElem !== context) {
                                    if (currentElem.classList.contains('remove-destination')) { return true }
                                    currentElem = currentElem.parentElement;
                                }

                                return false;
                            })()

                            // If another item was clicked, there's nothing to be done
                            if (!isCloseIcon) { return }

                            // Change the `destinations` state to the loader state
                            content.changeState(client.states.loading.stateName);

                            /**The context (item) ID */
                            const contextId = context.getAttribute('item-id');
                            const selectedItem = this.#_states.planItem.selectedItem;
                            const destination = selectedItem.destinations.find(i => String(i._id) === contextId);

                            // Prepare to prompt object
                            const prompt = {
                                tone: 'warning',
                                content: `Are you sure you want to remove ${destination.geo.name} from your ${selectedItem.title.endsWith('s') ? `${selectedItem.title}'` : `${selectedItem.title}'s`} destinations`,
                                action: { label: 'Remove' },
                                cancel: { include: true }
                            }

                            // Ask for user confirmation before removing/deleting the destination
                            /**
                             * The response from the user about removing the destination
                             * @type {{ confirmed: true }|{ confirmed: false, message: string }}
                             */
                            const response = await lightbox.open('prompt', prompt);

                            if (response.confirmed === true) {
                                selectedItem.removeDestination(contextId);  // from the plan and from local storage
                                context.remove();                           // from the DOM

                                /**
                                 * Depending on whether there are any destinations left or not:
                                 * change to the appropriate state
                                 */
                                content.changeState(client.states[selectedItem.destinations.length > 0 ? 'results' : 'noResults'].stateName);
                            } else {
                                /**
                                 * Since the user didn't confirm/approve the deletion/removal of the destination
                                 * change the state back to the results state
                                 */

                                content.changeState(client.states.results.stateName);
                            }
                        })
                    },
                    /**Helper functions that deals with the DOM */
                    ui: {
                        /**
                         * Create an HTML record for the destination
                         * @param {Destination} record
                         * @returns {HTMLDivElement}
                         */
                        createRecord: (record) => {
                            const now = new Date();

                            // Create the record element
                            const recEle = document.createElement('div');
                            recEle.classList.add('destination-item');
                            recEle.setAttribute('item-id', record._id);

                            /**
                             * Get the status of the destination depending on
                             * its starting and ending dates
                             * @type {'expired'|'upcoming'|'ongoing'}
                             */
                            const status = (() => {
                                if (now > record.period.end) {
                                    return 'expired';
                                } else if (now < record.period.start) {
                                    return 'upcoming';
                                } else {
                                    return 'ongoing';
                                }
                            })()

                            // Add the status as an attribute
                            recEle.setAttribute('status', status);

                            // Creating the top container
                            const topContainer = document.createElement('div');
                            topContainer.classList.add('top');

                            // Creating the left container
                            const left = document.createElement('div');
                            // Creating the right container
                            const right = document.createElement('div');

                            {
                                // Build the left section
                                left.classList.add('left');

                                const removeBtn = document.createElement('button');
                                removeBtn.classList.add('remove-destination');
                                removeBtn.classList.add('tone-danger');
                                const svg = helpers.createSVG(icons.closeIcon);
                                removeBtn.appendChild(svg);
                                left.appendChild(removeBtn);

                                const name = document.createElement('p');
                                name.classList.add('destination-name');
                                name.textContent = `${record.geo.name}${record.geo.countryCode !== 'PS' ? `, ${record.geo.countryName}` : ''}`;
                                left.appendChild(name);
                                recEle.appendChild(left);
                            }

                            {
                                // Build the right section
                                right.classList.add('right');

                                {
                                    const statusEle = document.createElement('p');
                                    statusEle.classList.add('destination-status-indicator')
                                    statusEle.textContent = (() => {
                                        if (status === 'expired') { return 'Past' }
                                        const time = helpers.timeDifference(record.period.start, record.period.end);
                                        return `${status === 'ongoing' ? 'Ends' : 'Starts'} ${time instanceof Date ? `on ${new CustomDate(time).toCustomString()}` : `${time === 'just now' ? '' : 'in '}${time}`}`;
                                    })();
                                    right.appendChild(statusEle);
                                }

                                {
                                    const weatherContainer = document.createElement('div');
                                    weatherContainer.classList.add('destination-weather-data');

                                    {
                                        const iconContainer = document.createElement('div');
                                        iconContainer.classList.add('weather-icon-container')
                                        const img = document.createElement('img');
                                        img.src = record.weather[0].weather.icon;
                                        img.alt = `${record.weather[0].weather.description} in ${record.geo.name}`;
                                        img.classList.add('weather-icon');
                                        iconContainer.appendChild(img);
                                        weatherContainer.appendChild(iconContainer);
                                    }

                                    {
                                        const weatherDetailsContainer = document.createElement('div');
                                        weatherDetailsContainer.classList.add('weather-details');

                                        {
                                            const tempsEle = document.createElement('p');
                                            tempsEle.textContent = `${record.weather[0].temp}°`;
                                            weatherDetailsContainer.appendChild(tempsEle);
                                        }

                                        {
                                            const summEle = document.createElement('p');
                                            summEle.textContent = record.weather[0].weather.description;
                                            weatherDetailsContainer.appendChild(summEle);
                                        }

                                        weatherContainer.appendChild(weatherDetailsContainer);
                                    }

                                    right.appendChild(weatherContainer);
                                }
                            }

                            topContainer.append(left, right);
                            recEle.append(topContainer);
                            return recEle;
                        },
                        /**
                         * @param {Destination[]} records 
                         * @param {boolean} reset
                         */
                        setItems: (records) => {
                            const { ui } = this.#_states.planItem.sections.destinations;

                            const repeater = document.getElementById('all-destination-state');
                            repeater.innerHTML = '';

                            const frag = document.createDocumentFragment();
                            for (const record of records) {
                                const recEle = ui.createRecord(record);
                                frag.appendChild(recEle);
                            }

                            repeater.appendChild(frag);
                        }
                    }
                },
                flights: {
                    elements: {
                        /**@type {HTMLButtonElement} */
                        actionBtn: document.getElementById('flights-action-btn'),
                        /**@type {MultiStateBox} */
                        content: new MultiStateBox('selected-plan-flights-box')
                    },
                    states: {
                        noResults: { stateName: 'no-flights-state' },
                        results: { stateName: 'all-flights-state' }
                    },
                    reset: () => {
                        const { elements, states } = this.#_states.planItem.sections.flights;
                        elements.content.changeState(states.noResults.stateName);
                    },
                    initialize: () => {
                        const client = this.#_states.planItem.sections.flights;
                        const { actionBtn, content } = client.elements;

                        actionBtn.addEventListener('click', () => helpers.showMessage(`Flights are not supported yet. Please try again later.`));
                    }
                },
                hotels: {
                    elements: {
                        /**@type {HTMLButtonElement} */
                        actionBtn: document.getElementById('hotels-action-btn'),
                        /**@type {MultiStateBox} */
                        content: new MultiStateBox('selected-plan-hotel-box')
                    },
                    states: {
                        noResults: { stateName: 'no-hotels-state' },
                        results: { stateName: 'all-hotels-state' }
                    },
                    reset: () => {
                        const { elements, states } = this.#_states.planItem.sections.hotels;
                        elements.content.changeState(states.noResults.stateName);
                    },
                    initialize: () => {
                        const client = this.#_states.planItem.sections.hotels;
                        const { actionBtn, content } = client.elements;

                        actionBtn.addEventListener('click', () => helpers.showMessage(`Hotel reservations are not supported yet. Please try again later.`));
                    }
                },
                todos: {
                    elements: {
                        /**@type {HTMLButtonElement} */
                        actionBtn: document.getElementById('todos-action-btn'),
                        /**@type {MultiStateBox} */
                        content: new MultiStateBox('selected-todos-states-box')
                    },
                    states: {
                        noResults: { stateName: 'no-todos-state' },
                        results: { stateName: 'all-todos-state' }
                    },
                    reset: () => {
                        const { elements, states } = this.#_states.planItem.sections.todos;
                        elements.content.changeState(states.noResults.stateName);
                    },
                    initialize: () => {
                        const client = this.#_states.planItem.sections.todos;
                        const { actionBtn, content } = client.elements;

                        actionBtn.addEventListener('click', () => helpers.showMessage(`TODO lists are not supported yet. Please try again later.`));
                    }
                }
            },
            helpers: {
                title: {
                    validity: {
                        reject: (err) => {
                            const elements = this.#_states.planItem.elements;
                            elements.titleInput.setCustomValidity(err);
                            elements.titleErrMsg.textContent = err;
                            if (elements.titleErrMsg.hasAttribute('hidden')) { elements.titleErrMsg.removeAttribute('hidden') }
                        },
                        resetValidityIndication: () => {
                            const elements = this.#_states.planItem.elements;
                            elements.titleInput.setCustomValidity('');
                            elements.titleErrMsg.textContent = '';
                            if (!elements.titleErrMsg.hasAttribute('hidden')) { elements.titleErrMsg.setAttribute('hidden', '') }
                        },
                        /**
                         * Validate the pla title
                         * @param {string} [planTitle] The title value
                         * @returns { {valid: true} | { valid: false, message: string, indicateError: boolean } }
                         */
                        validate: (planTitle) => {
                            const elements = this.#_states.planItem.elements;
                            if (planTitle === undefined) { planTitle = elements.titleInput.value }
                            const invalid = { valid: false, message: '', indicateError: true }

                            if (typeof planTitle !== 'string') {
                                invalid.message = `The plan title should be a string`;
                                return invalid;
                            }

                            if (planTitle.length === 0) {
                                invalid.message = 'The plan title cannot be blank';
                                return invalid;
                            }

                            if (planTitle.length < 5) {
                                invalid.message = `The plan title is too short. ${5 - planTitle.length} chars left.`;
                                return invalid;
                            }

                            return { valid: true }
                        }
                    }
                }
            },
            /**
             * Update the selected `TravelPlan`.
             * @param {*} data The data to be updated
             */
            update: async (data) => {
                const planItem = this.#_states.planItem;
                const results = this.#_states.records.states.results;

                /**
                 * All the `destinations` records.
                 * @type {HTMLDivElement[]}
                 */
                const records = Array.from(results.elements.repeater.children).filter(i => i.nodeName === 'DIV' && i.hasAttribute('item-id'));

                const recordEle = records.find(i => i.getAttribute('item-id') === planItem.selectedItem._id)
                if (!recordEle) { throw new Error(`Unable to update the record. The record was not found.`) }
                const children = Array.from(recordEle.children);

                if ('title' in data) {
                    if (planItem.selectedItem.title !== data.title) {
                        planItem.selectedItem.title = data.title;
                        children.find(i => i.classList.contains('plan-item-name')).textContent = data.title;
                    }
                }

                if ('destinations' in data) {
                    const destinations = data.destinations;
                    if (destinations.type === 'add') {
                        const { destination, period } = destinations.item;

                        // Add the destination definition to the records
                        await this.#_states.planItem.selectedItem.addDestination(destination, period).catch(err => {
                            if (err?.type === 'bad_request') {
                                helpers.showMessage(err.message);
                            } else {
                                throw err;
                            }
                        })
                        // Re-render the sorted destinations
                        planItem.sections.destinations.ui.setItems(this.#_states.planItem.selectedItem.destinations);
                    }
                }
            },
            /**Initialize the `plan-item` state */
            initialize: () => {
                const { elements, sections, helpers, update, titleMaxChar } = this.#_states.planItem;

                // Add a click event listener to the back button
                elements.backBtn.addEventListener('click', () => {
                    this.#_container.changeState(this.#_states.records.stateName);
                })

                // Add a click event listener to the remove plan button
                elements.removeBtn.addEventListener('click', async () => {
                    // Prepare the prompt
                    const prompt = {
                        tone: 'danger',
                        content: `Are you sure you want to remove your "${this.#_states.planItem.selectedItem.title}" plan? This is permanent and you cannot undo that.`,
                        action: { label: 'Remove' },
                        cancel: { include: true }
                    }

                    // Ask for a confirmation from the user for plan removal
                    /**
                     * The user response about the plan removal
                     * @type {{ confirmed: boolean }}
                     */
                    const response = await lightbox.open('prompt', prompt);

                    // If the user didn't confirm/approve the removal, then do nothing and return
                    if (!response.confirmed) { return }

                    // Prepare for processing by changing to the loader state
                    this.#_container.changeState(this.#_states.loader.stateName);

                    const plan_id = this.#_states.planItem.selectedItem._id;

                    // Remove the plan from the cache and from local storage
                    travelPlansManager.removePlan(plan_id);

                    const repeater = document.getElementById('records-repeater');
                    const match = Array.from(repeater.children).find(i => i.getAttribute('item-id') === plan_id);
                    
                    // if the element is found, remove it from the DOM
                    if (match) { match.remove() }

                    if (travelPlansManager.records.length === 0) {
                        // if not other plans left, change the state to indicate that there are no plans left
                        this.#_states.records.elements.content.changeState(this.#_states.records.states.noResults.stateName);
                    }

                    // Change the state back to the records (main) state
                    this.#_container.changeState(this.#_states.records.stateName);
                })

                elements.editTitleIcon.addEventListener('click', () => {
                    elements.editTitleIcon.removeAttribute('active');
                    if (elements.titleInput.hasAttribute('readonly')) { elements.titleInput.removeAttribute('readonly') }
                    elements.titleInput.focus();
                })

                elements.titleInput.addEventListener('input', (event) => {
                    const title = event.target.value;

                    elements.title.textContent = (() => {
                        const value = title.length > 0 ? title : this.#_states.planItem.selectedItem.title;
                        return value.length > titleMaxChar ? `${value.substring(0, titleMaxChar)}...` : value;
                    })();

                    const { validate, resetValidityIndication, reject } = this.#_states.planItem.helpers.title.validity;
                    const validity = validate(title);

                    if (validity.valid) {
                        resetValidityIndication();
                    } else {
                        if (validity.indicateError) {
                            reject(validity.message);
                        } else {
                            resetValidityIndication();
                        }
                    }
                })

                elements.titleInput.addEventListener('keydown', event => {
                    if (event.key === 'Enter') {
                        const validity = helpers.title.validity.validate(event.target.value);
                        if (validity.valid) {
                            update({ title: event.target.value });
                            elements.editTitleIcon.setAttribute('active', '');
                            elements.titleInput.setAttribute('readonly', '');
                            helpers.title.validity.resetValidityIndication();
                        }
                    }

                    if (event.key === 'Escape') {
                        elements.title.textContent = elements.titleInput.value = this.#_states.planItem.selectedItem.title;
                        elements.editTitleIcon.setAttribute('active', '');
                        elements.titleInput.setAttribute('readonly', '');
                        helpers.title.validity.resetValidityIndication();
                    }
                })

                elements.titleInput.addEventListener('blur', () => {
                    elements.title.textContent = elements.titleInput.value = this.#_states.planItem.selectedItem.title;
                    elements.editTitleIcon.setAttribute('active', '');
                    elements.titleInput.setAttribute('readonly', '');
                    helpers.title.validity.resetValidityIndication();
                })

                const { destinations, flights, hotels, todos } = sections;

                destinations.initialize();
                flights.initialize();
                hotels.initialize();
                todos.initialize();
            },
            reset: () => {
                const { elements, sections } = this.#_states.planItem;
                const { editTitleIcon, planImg, title, titleInput, titleErrMsg, startDate, endDate, metrics } = elements;

                titleInput.value = title.textContent = titleErrMsg.textContent = planImg.src = '';
                titleInput.setCustomValidity('');
                if (!titleInput.hasAttribute('readonly')) { titleInput.setAttribute('readonly', '') }
                if (!titleErrMsg.hasAttribute('hidden')) { titleErrMsg.setAttribute('hidden', '') }
                if (!titleErrMsg.hasAttribute('hidden')) { titleErrMsg.setAttribute('hidden', '') }
                if (!editTitleIcon.hasAttribute('active')) { editTitleIcon.setAttribute('active', '') }

                startDate.textContent = 'Starting on:';
                endDate.textContent = 'Ending on:';

                metrics.destinations.textContent = metrics.flights.textContent = metrics.hotels.textContent = metrics.todos.textContent = '0';

                sections.destinations.reset();
                sections.flights.reset();
                sections.hotels.reset();
                sections.todos.reset();
            },
            /**@param {TravelPlan} plan */
            open: async (plan) => {
                this.#_container.changeState(this.#_states.loader.stateName);

                const now = new Date();
                /**An array of promises to update the weather of all destinations */
                const promises = plan.destinations.map(destination => {
                    return new Promise((resolve, reject) => {
                        const lastUpdate = destination.lastUpdate;
                        if (helpers.isRealDate(lastUpdate)) {
                            if (lastUpdate.getTime() + 8.64e+7 < now.getTime()) { return resolve() }
                        }

                        helpers.getForecast({ lat: destination.geo.lat, lon: destination.geo.lng }, destination.period).then(data => {
                            destination.weather = data;
                            destination.lastUpdate = now;
                            resolve();
                        }).catch(err => reject(err));
                    })
                })

                await Promise.allSettled(promises);

                this.#_states.planItem.selectedItem = plan;
                const { elements, sections, reset, titleMaxChar } = this.#_states.planItem;
                const { planImg, title, titleInput, startDate, endDate, metrics } = elements;

                reset();
                await helpers.searchImages(plan.title).then(img => {
                    if (img) { planImg.src = img }
                })


                titleInput.value = plan.title;
                title.textContent = plan.title.length > titleMaxChar ? `${plan.title.substring(0, titleMaxChar)}...` : plan.title;
                const from = new CustomDate(plan.from.toISOString()).toCustomString();
                const to = new CustomDate(plan.to.toISOString()).toCustomString();
                startDate.textContent = `Trip Starts ${from.startsWith('in') ? from : `on ${from}`}`;
                endDate.textContent = `Trip Ends ${to.startsWith('in') ? to : `on ${to}`}`;

                metrics.destinations.textContent = String(plan.destinations.length);
                metrics.flights.textContent = String(plan.flights.length);
                metrics.hotels.textContent = String(plan.hotelReservations.length);
                metrics.todos.textContent = String(plan.todos.length);

                /**
                 * TODO: Implement a way to render the data here
                 */
                if (plan.destinations.length > 0) {
                    sections.destinations.ui.setItems(plan.destinations);
                    sections.destinations.elements.content.changeState(sections.destinations.states.results.stateName);
                }

                if (plan.flights.length) { }
                if (plan.hotelReservations.length) { }
                if (plan.todos.length) { }

                this.#_container.changeState(this.#_states.planItem.stateName);
            }
        }
    }

    /**Initialize the app data and event listeners */
    init() {
        const { records, createPlan, planItem } = this.#_states;

        records.initialize();
        createPlan.initialize();
        planItem.initialize();

        this.#_container.changeState(this.#_states.records.stateName);
    }
}

export default new App();