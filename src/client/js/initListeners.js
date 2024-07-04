export function initListeners() {
    document.addEventListener('DOMContentLoaded', () => {
        const overlay = document.getElementById('overlay');
        const content = document.getElementById('mainContent');

        content.setAttribute('ready', '');
        overlay.setAttribute('disabled', '');
    })

    document.addEventListener('loadstart', () => {
        const overlay = document.getElementById('overlay');
        const content = document.getElementById('mainContent');

        content.removeAttribute('ready');
        overlay.removeAttribute('disabled');
    })
}