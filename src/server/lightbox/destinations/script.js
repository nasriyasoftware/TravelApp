/**@typedef {{ valid: false, message: string, indicateError: boolean }|{ valid: true }} ValidityResponse */

// import TravelPlan from "../../../client/js/travel/TravelPlan";

/**
 * @param {TravelPlan} plan 
 * @param {Function} close 
 */
function handler(plan, close) {
    const buttons = {
        /**@type {HTMLDivElement} */
        closeIcon: document.getElementById('lightbox-close-icon'),
        /**@type {HTMLButtonElement} */
        addBtn: document.getElementById('addDestination-form-btn')
    }

    const inputs = {
        /**@type {HTMLInputElement} */
        destination: document.getElementById('plan-destination-input'),
        /**@type {HTMLInputElement} */
        arrive: document.getElementById('destination-arrive-input'),
        /**@type {HTMLInputElement} */
        leave: document.getElementById('destination-leave-input')
    }

    const helpers = {
        isRealDate: (value) => {
            const date = new Date(value);
            return !isNaN(date.getTime());
        },
        /**@param {Date} date */
        getStrDate: (date) => {
            return date.toISOString().split('T')[0]
        },
        validate: {
            /**
             * @param {string} value
             * @returns {ValidityResponse}
             */
            destination: (value) => {
                if (value === undefined) { value = inputs.destination.value }
                const invalid = { valid: false, message: '', indicateError: true }
                if (typeof value !== 'string') {
                    invalid.message = `The destination value must be a string`;
                    return invalid;
                }

                if (value.length === 0) {
                    invalid.indicateError = false;
                    return invalid;
                }

                if (plan.destinations.filter(i => i.geo.name.toLowerCase() === value.toLowerCase()).length > 0) {
                    invalid.message = `This destination has already been added`;
                    return invalid;
                }

                return { valid: true }
            },
            /**
             * @param {string} value 
             * @returns {ValidityResponse}
             */
            arriveDate: (arriveDateStr) => {
                if (arriveDateStr === undefined) { arriveDateStr = inputs.arrive.value }
                const invalid = { valid: false, message: '', indicateError: true }

                if (arriveDateStr.length === 0) {
                    invalid.indicateError = false;
                    return invalid;
                }

                inputs.leave.disabled = true;

                if (!helpers.isRealDate(arriveDateStr)) {
                    invalid.message = `The provided arrive date value is not a valid Date`;
                    return invalid;
                }

                const arriveDate = arriveDateStr instanceof Date ? arriveDateStr : new Date(arriveDateStr);
                const now = new Date();

                if (helpers.getStrDate(now) === helpers.getStrDate(arriveDate)) {
                    invalid.message = `The arriving date cannot be today`;
                    return invalid;
                }

                if (arriveDate < now) {
                    invalid.message = `The arriving date cannot be in the past`;
                    return invalid;
                }

                if (arriveDate < plan.from) {
                    invalid.message = `The arriving date cannot be before the trip's starting date`;
                    return invalid;
                }

                if (arriveDate > plan.to) {
                    invalid.message = `The arriving date cannot be after the trip's returning date`;
                    return invalid;
                }

                const overlapping = helpers.checkOverlapingDates(arriveDate, 'start');
                if (overlapping.overlap) {
                    invalid.message = `This date overlaps with your destination "${overlapping.with}"`;
                    return invalid
                }

                inputs.leave.disabled = false;
                return { valid: true }
            },
            /**
             * @param {string} leaveDateStr 
             * @returns {ValidityResponse}
             */
            leaveDate: (leaveDateStr) => {
                if (leaveDateStr === undefined) { leaveDateStr = inputs.leave.value }
                const invalid = { valid: false, message: '', indicateError: true }

                if (leaveDateStr.length === 0) {
                    invalid.indicateError = false;
                    return invalid;
                }

                if (!helpers.isRealDate(inputs.arrive.value)) {
                    invalid.message = `Select the arriving date first`;
                    return invalid;
                }

                if (!helpers.isRealDate(leaveDateStr)) {
                    invalid.message = `The provided leave date value is not a valid Date`;
                    return invalid;
                }

                const leaveDate = leaveDateStr instanceof Date ? leaveDateStr : new Date(leaveDateStr);
                const now = new Date();

                if (helpers.getStrDate(now) === helpers.getStrDate(leaveDate)) {
                    invalid.message = `The leaving date cannot be today`;
                    return invalid;
                }

                if (leaveDate < now) {
                    invalid.message = `The leaving date cannot be in the past`;
                    return invalid;
                }

                if (leaveDate < new Date(inputs.arrive.value)) {
                    invalid.message = `The leaving date cannot be before the arriving date`;
                    return invalid;
                }

                if (leaveDate > plan.to) {
                    invalid.message = `The leaving date cannot be after the trip's ending date`;
                    return invalid;
                }

                const overlapping = helpers.checkOverlapingDates(leaveDate, 'end');
                if (overlapping.overlap) {
                    invalid.message = `This date overlaps with your destination "${overlapping.with}"`;
                    return invalid
                }

                return { valid: true }
            }
        },
        /**
         * @param {HTMLInputElement} input 
         * @param {string} message
         */
        reject: (input, message) => {
            input.setCustomValidity(message);
            const err = document.getElementById(`${input.id}_err_msg`);
            err.lastChild.textContent = input.validationMessage;
            if (err.hasAttribute('hidden')) { err.removeAttribute('hidden') }
        },
        /**
         * @param {HTMLInputElement} input 
         */
        resetValidityIndication: (input) => {
            input.setCustomValidity('');
            const err = document.getElementById(`${input.id}_err_msg`);
            if (!err.hasAttribute('hidden')) { err.setAttribute('hidden', '') }
            err.lastChild.textContent = '';
        },
        validateState: () => {
            const destination = helpers.validate.destination();
            const arriveDate = helpers.validate.arriveDate();
            const leaveDate = helpers.validate.leaveDate();
            const isValid = destination.valid && arriveDate.valid && leaveDate.valid;

            if (isValid) {
                buttons.addBtn.disabled = false;
            } else {
                buttons.addBtn.disabled = true;
            }

            return isValid;
        },
        /**
         * @param {Date} date 
         * @param {'start'| 'end'} type
         * @returns {{overlap: true, with: string} | {overlap: false}}
         */
        checkOverlapingDates: (date, type) => {
            for (const destination of plan.destinations) {
                const within = destination.period.start <= date && date <= destination.period.end;
                if (within) {
                    if (
                        (type === 'start' && date !== destination.period.end) ||
                        (type === 'end' && date !== destination.period.start)
                    ) {
                        return { overlap: true, with: destination.geo.name }
                    }
                }                
            }
            return { overlap: false }
        }
    }

    buttons.closeIcon.addEventListener('click', () => close({ ok: false }));

    inputs.destination.addEventListener('input', (event) => {
        const validity = helpers.validate.destination(event.target.value);

        if (validity.valid) {
            helpers.resetValidityIndication(event.target);
        } else {
            if (validity.indicateError) {
                helpers.reject(event.target, validity.message);
            } else {
                helpers.resetValidityIndication(event.target);
            }
        }

        helpers.validateState();
    })

    inputs.arrive.addEventListener('change', (event) => {
        const validity = helpers.validate.arriveDate(event.target.value);

        if (validity.valid) {
            helpers.resetValidityIndication(event.target);
            inputs.leave.value = '';
            inputs.leave.focus();
        } else {
            if (validity.indicateError) {
                helpers.reject(event.target, validity.message);
            } else {
                helpers.resetValidityIndication(event.target);
            }
        }

        helpers.validateState();
    })

    inputs.leave.addEventListener('change', (event) => {
        const validity = helpers.validate.leaveDate(event.target.value);

        if (validity.valid) {
            helpers.resetValidityIndication(event.target);
        } else {
            if (validity.indicateError) {
                helpers.reject(event.target, validity.message);
            } else {
                helpers.resetValidityIndication(event.target);
            }
        }

        helpers.validateState();
    })

    buttons.addBtn.addEventListener('click', () => {
        if (helpers.validateState()) {
            close({
                ok: true,
                data: {
                    destination: inputs.destination.value,
                    arriveDate: new Date(inputs.arrive.value),
                    leaveDate: new Date(inputs.leave.value),
                }
            });
        }
    })

    inputs.destination.focus();
}