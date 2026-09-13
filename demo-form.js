(() => {
  const modal = document.querySelector('#demo-dialog');
  const form = document.querySelector('#demo-form');
  const status = document.querySelector('#demo-status');
  const submit = document.querySelector('#demo-submit');
  let pending = false, requestId = '', timeout;
  form.addEventListener('input', () => { if (!pending) requestId = ''; });
  document.querySelectorAll('[data-demo]').forEach(button => button.addEventListener('click', event => {
    event.preventDefault(); modal.showModal();
  }));
  modal.querySelector('.demo-close').addEventListener('click', () => modal.close());
  modal.addEventListener('click', event => {
    const r = modal.getBoundingClientRect();
    if (event.target === modal && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) modal.close();
  });
  function cleanup() {
    clearTimeout(timeout); pending = false; submit.disabled = false;
    form.removeAttribute('aria-busy'); submit.textContent = 'Request a Demo ↗';
    form.querySelectorAll('input, select, textarea').forEach(field => field.disabled = false);
  }
  window.addEventListener('message', event => {
    const trusted = /^https:\/\/([a-z0-9-]+\.)?script\.googleusercontent\.com$/.test(event.origin) || event.origin === 'https://script.google.com';
    const response = event.data;
    if (!pending || !trusted || response?.type !== 'cadence-lead' || response.requestId !== requestId) return;
    cleanup();
    if (response.ok === true) {
      form.reset(); requestId = '';
      status.textContent = 'Thanks! Your request is received. We’ll get back to you within 24 hours.';
    } else status.textContent = 'We couldn’t save your request. Please try again or email us below.';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    const endpoint = window.CADENCE_LEADS_ENDPOINT || '';
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint)) {
      status.textContent = 'Online booking is not available yet. Please email us below and we’ll reply within 24 hours.';
      return;
    }
    if (!/^https?:$/.test(location.protocol)) {
      status.textContent = 'Please use the published website to submit, or email us below.'; return;
    }
    requestId ||= crypto.randomUUID();
    const data = new FormData(form);
    data.set('requestId', requestId); data.set('origin', location.origin);
    // Apps Script redirects its response to a Google-hosted origin that cannot be framed.
    // A simple no-cors POST avoids preflight and the X-Frame-Options restriction.
    pending = true; submit.disabled = true;
    form.setAttribute('aria-busy', 'true'); submit.textContent = 'Sending…'; status.textContent = '';
    form.querySelectorAll('input, select, textarea').forEach(field => field.disabled = true);
    timeout = setTimeout(() => {
      cleanup(); status.textContent = 'We couldn’t confirm delivery. Retry safely, or email us below. Your details are still here.';
    }, 30000);
    fetch(endpoint, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(data) })
      .then(() => { if (!pending) return; cleanup(); form.reset(); requestId = ''; status.textContent = 'Thanks! Your request is received. We’ll get back to you within 24 hours.'; })
      .catch(() => { if (!pending) return; cleanup(); status.textContent = 'We couldn’t send your request. Please try again or email us below.'; });
  });
})();
