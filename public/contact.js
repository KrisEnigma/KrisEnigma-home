// contact.js — reads i18n strings from form data-* attributes
if (!window.__krisContactLoaded) {
  window.__krisContactLoaded = true;

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Read i18n strings from data attributes (set by Astro at build time)
    const i18n = {
      success: form.dataset.success || '¡Gracias por tu mensaje!',
      error: form.dataset.error || 'Error al enviar.',
      required: form.dataset.required || 'Todos los campos son obligatorios.',
      sending: form.dataset.sending || 'Enviando...',
      submit: form.dataset.submit || 'Enviar Mensaje',
    };

    let formStartTimestamp = Date.now();

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const submitBtn = document.getElementById('submitBtn');
      const msg = document.getElementById('thankyouMessage');

      // Reset
      if (msg) { msg.className = 'feedback-msg hidden'; msg.textContent = ''; }
      form.querySelectorAll('input, select, textarea').forEach(el => el.classList.remove('border-red-500'));

      // Validate
      const name = form.name?.value?.trim();
      const email = form.email?.value?.trim();
      const subject = form.subject?.value;
      const message = form.message?.value?.trim();
      const urltrap = form.urltrap?.value || '';

      let valid = true;
      if (!name || name.length < 2) { valid = false; form.name?.classList.add('border-red-500'); }
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { valid = false; form.email?.classList.add('border-red-500'); }
      if (!subject) { valid = false; form.subject?.classList.add('border-red-500'); }
      if (!message || message.length < 2) { valid = false; form.message?.classList.add('border-red-500'); }

      if (!valid) {
        if (msg) { msg.className = 'feedback-msg error'; msg.textContent = i18n.required; }
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = i18n.sending; }

      try {
        const res = await fetch('https://mailer.krisenigma.workers.dev/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message, urltrap, formStart: formStartTimestamp }),
        });
        const result = await res.json();

        if (result.success) {
          if (msg) { msg.className = 'feedback-msg success'; msg.textContent = i18n.success; }
          form.reset();
          formStartTimestamp = Date.now();
          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'contact_form_submit', {
              event_category: 'Conversion',
              event_label: subject,
              value: 1
            });
          }
        } else {
          if (msg) { msg.className = 'feedback-msg error'; msg.textContent = result.error || i18n.error; }
        }
      } catch {
        if (msg) { msg.className = 'feedback-msg error'; msg.textContent = i18n.error; }
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = i18n.submit; }
      }
    });
  });
}
