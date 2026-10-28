(() => {
  const count = document.querySelector('#scenario-students');
  const range = document.querySelector('#scenario-range');
  const rate = document.querySelector('#scenario-rate');
  const output = document.querySelector('#scenario-total');
  const equation = document.querySelector('#scenario-equation');
  const presets = [...document.querySelectorAll('[data-students]')];
  const format = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  function update() {
    const students = Number(count.value);
    if (!count.value || !Number.isInteger(students) || students < 1 || students > 10000) {
      output.textContent = 'Enter 1–10,000';
      equation.textContent = 'Use a whole number of students.';
      presets.forEach(button => button.setAttribute('aria-pressed', 'false'));
      return;
    }
    range.value = String(students);
    const tuition = Number(rate.value);
    output.textContent = '$' + format.format(students * tuition);
    equation.textContent = format.format(students) + ' students × $' + format.format(tuition) + ' per student';
    presets.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.students) === students)));
  }
  count.addEventListener('input', update);
  range.addEventListener('input', () => { count.value = range.value; update(); });
  rate.addEventListener('change', update);
  presets.forEach(button => button.addEventListener('click', () => { count.value = button.dataset.students; update(); }));
  update();
})();
