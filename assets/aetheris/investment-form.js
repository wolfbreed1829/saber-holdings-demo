/* Local email preparation only. No network submission or browser persistence. */
(() => {
  const form = document.querySelector('#investment-form');
  const result = document.querySelector('#application-result');
  const preview = document.querySelector('#application-preview');
  const status = document.querySelector('#copy-status');
  const recipient = 'mpatrick@sabertechlogistics.com';
  const subject = 'Aetheris Inc. - Investment expression of interest';
  const currency = form.elements.currency;
  function currencyRule() { currency.required = Boolean(form.elements.amount.value); }
  form.elements.amount.addEventListener('input', currencyRule);
  form.addEventListener('submit', event => {
    event.preventDefault();
    currencyRule();
    for (const name of ['name', 'email', 'country', 'message']) {
      const field = form.elements[name];
      field.value = field.value.trim();
    }
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const value = name => String(data.get(name) || '').trim() || 'Not provided';
    const amount = data.get('amount') ? value('amount') + ' ' + value('currency') : 'Not specified';
    const body = [
      'Aetheris Inc. - Investment expression of interest', '',
      'Full name: ' + value('name'), 'Email: ' + value('email'),
      'Organization: ' + value('organization'), 'Role: ' + value('role'),
      'Phone: ' + value('phone'), 'Country: ' + value('country'),
      'Investor / partner type: ' + value('type'), 'Timeline: ' + value('timeline'),
      'Indicative investment amount: ' + amount, '', 'Interest and background:', value('message'), '',
      'I agree to be contacted by Aetheris about this inquiry. This is an expression of interest, not an investment commitment.'
    ].join('\n');
    preview.value = 'To: ' + recipient + '\nSubject: ' + subject + '\n\n' + body;
    result.hidden = false;
    status.textContent = '';
    result.focus();
    window.location.href = 'mailto:' + recipient + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
  document.querySelector('#copy-application').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(preview.value);
      status.textContent = 'Copied. Paste into an email to ' + recipient + ' and send it yourself.';
    } catch {
      preview.focus(); preview.select();
      status.textContent = 'Copy was unavailable. The application is selected; use your device copy command.';
    }
  });
  document.querySelector('#download-application').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([preview.value], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'aetheris-investment-inquiry.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'Downloaded. Attach the file to an email to ' + recipient + ' and send it yourself.';
  });
})();
