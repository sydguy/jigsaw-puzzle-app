// Local, reversible design demonstrations only. No network or app state.
let messageTimer;
function announce(message) {
  const output = document.getElementById('demo-message');
  output.textContent = message; output.hidden = false;
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => { output.hidden = true; }, 3000);
}
document.querySelectorAll('[role="group"]').forEach(group => {
  group.querySelectorAll('button[aria-pressed]').forEach(button => {
    button.addEventListener('click', () => {
      group.querySelectorAll('button[aria-pressed]').forEach(peer => peer.setAttribute('aria-pressed', String(peer === button)));
      if (button.dataset.count) document.getElementById('piece-count').textContent = `${button.dataset.count} pieces`;
    });
  });
});
document.getElementById('exclude-owned').addEventListener('change', event => {
  document.getElementById('owned-specimen').hidden = event.target.checked;
});
document.querySelectorAll('[data-demo]').forEach(button => button.addEventListener('click', () => announce(`${button.dataset.demo} · design demonstration only`)));
const deleteDialog = document.getElementById('delete-dialog');
document.getElementById('open-delete').addEventListener('click', () => deleteDialog.showModal());
deleteDialog.addEventListener('close', () => { if (deleteDialog.returnValue === 'confirm') announce('Confirmation demonstrated. No data was deleted.'); });
const grid = document.getElementById('tablet-grid');
const specimens = [['lakeside', 'Mountain Lake', 'Nature'], ['puppy', 'Playful Puppy', 'Animals'], ['castle', 'Fairy Tale Castle', 'Fantasy']];
for (let i = 0; i < 24; i++) {
  const [file, title, theme] = specimens[i % specimens.length];
  const card = document.createElement('div');
  const img = document.createElement('img'); img.src = `specimens/${file}.png`; img.alt = '';
  const heading = document.createElement('b'); heading.textContent = title;
  const tag = document.createElement('small'); tag.textContent = theme;
  card.append(img, heading, tag); grid.append(card);
}
