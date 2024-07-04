/**
 * @typedef {object} HandlerData
 * @prop {'neutral'|'regular'|'success'|'danger'|'warning'|'warning'|'info'} [tone] The tone of the prompt. Default: `neutral`
 * @prop {string} content The content to be displayed
 * @prop {'html'|'text'} [type] Default: `text`
 * @prop {ActionBtn} [action]
 * @prop {CancelBtn} [cancel]
 * 
*/

/**
 * @typedef {object} ActionBtn
 * @prop {string} [label] Default: `OK` for optional confirmation and `Confirm` for required
 */

/**
 * @typedef {object} CancelBtn
 * @prop {boolean} [include] Default: `false`
 * @prop {string} [label] Default: `Cancel`
 */

/**
 * @param {HandlerData} data 
 * @param {Function} close 
 */
function handler(data = { tone: 'regular', type: 'text' }, close) {
    const elements = {
        /**@type {HTMLParagraphElement} */
        message: document.getElementById('lightbox-prompt-message'),
        /**@type {HTMLButtonElement} */
        action: document.getElementById('action-prompt-btn'),
        /**@type {HTMLButtonElement} */
        cancel: document.getElementById('cancel-prompt-btn'),
        /**@type {HTMLDivElement} */
        closeIcon: document.getElementById('lightbox-close-icon'),
        /**@type {HTMLDivElement} */
        title: document.getElementById('prompt-strip')
    }

    // Check the content type
    if (typeof data.content !== 'string') { throw new Error(`No message was provided to the prompt lightbox`) }
    data.content = data.content.trim();
    if (data.content.length === 0) { throw new Error(`An empty message was passed to the prompt lightbox`) }


    // Set the prompt tone
    const tone = data.tone || 'neutral';
    elements.message.parentElement.setAttribute('tone', tone);

    // Set the prompt title
    const title = tone === 'danger' ? 'Caution' : tone === 'warning' ? 'Warning' : null;
    if (title) { elements.title.textContent = title }

    if ('action' in data && data.action) {
        if ('label' in data.action) {
            if (typeof data.action.label !== 'string') { throw new TypeError(`The prompt action button's label is expected to be a string, instead got ${typeof data.action.label}`) }
            elements.action.textContent = data.action.label;
        }
    }

    if ('cancel' in data && data.cancel) {
        if ('include' in data.cancel) {
            if (typeof data.cancel.include !== 'boolean') { throw new TypeError(`The prompt cancel button's label is expected to be a boolean, instead got ${typeof data.cancel.include}`) }
            if (data.cancel.include === true) {
                elements.cancel.removeAttribute('hidden');
                elements.cancel.addEventListener('click', () => close({ confirmed: false, action: 'canceled' }));
            }
        }
    }

    elements.message[data.type === 'html' ? 'innerHTML' : 'textContent'] = data.content;
    elements.closeIcon.addEventListener('click', () => close({ confirmed: false, action: 'closed' }));
    elements.action.addEventListener('click', () => close({ confirmed: true }))
}