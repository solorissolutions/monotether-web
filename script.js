const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Waitlist: submit to Formspree without leaving the page.
// Without JS, the form's action/method still posts to Formspree directly.
const form = document.getElementById('signup');
const note = document.getElementById('signup-note');
const button = form && form.querySelector('button');
const buttonLabel = button && button.textContent;

if (form) form.addEventListener('submit', async (e) => {
  e.preventDefault();
  button.disabled = true;
  button.textContent = 'Sending…';
  note.textContent = '';
  form.email.removeAttribute('aria-invalid');

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      form.reset();
      note.textContent = "Thanks. You're on the list.";
    } else {
      const data = await res.json().catch(() => ({}));
      const errors = data.errors || [];
      if (errors.some((err) => err.field === 'email')) form.email.setAttribute('aria-invalid', 'true');
      note.textContent = errors.map((err) => err.message).join(' ') || 'Something went wrong. Please try again.';
    }
  } catch {
    note.textContent = 'Network error. Please try again.';
  } finally {
    button.disabled = false;
    button.textContent = buttonLabel;
  }
});
