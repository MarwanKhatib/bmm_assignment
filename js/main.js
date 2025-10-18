// Basic utilities and page-specific logic
document.addEventListener('DOMContentLoaded', () => {
  setupCompareSlider();
  setupSizeButtons();
  setupDownloadButton();
});

/* ========== Compare slider ========== */
function setupCompareSlider(){
  const slider = document.getElementById('slider');
  const overlay = document.getElementById('overlay');
  const leftImg = document.getElementById('left-img');
  const rightImg = document.getElementById('right-img');
  const leftSelect = document.getElementById('left-select');
  const rightSelect = document.getElementById('right-select');

  if(!slider || !overlay) return;

  const applyPosition = (value) => {
    overlay.style.width = value + '%';
  };

  slider.addEventListener('input', (e) => applyPosition(e.target.value));

  // swap image sources when selects change
  leftSelect && leftSelect.addEventListener('change', (e) => {
    leftImg.src = e.target.value;
  });
  rightSelect && rightSelect.addEventListener('change', (e) => {
    rightImg.src = e.target.value;
  });

  // initialize
  applyPosition(slider.value);
}

/* ========== Image size retrieval ========== */
async function getImageSize(url){
  try {
    const res = await fetch(url, { method: 'GET' });
    const blob = await res.blob();
    return blob.size; // bytes
  } catch (err) {
    console.warn('Could not fetch image size:', err);
    return null;
  }
}

function humanFileSize(bytes){
  if(bytes === null) return 'unknown';
  const thresh = 1024;
  if(Math.abs(bytes) < thresh) return bytes + ' B';
  const units = ['KB','MB','GB','TB','PB','EB','ZB','YB'];
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while(Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + ' ' + units[u];
}

function setupSizeButtons(){
  // single image size (index.html / comparison picture)
  const btn = document.getElementById('btn-size');
  const info = document.getElementById('img-info');
  if(btn && info){
    btn.addEventListener('click', async () => {
      // look for the <picture> or <img> inside #picture-sample
      const picture = document.getElementById('picture-sample');
      if(!picture) return;
      // choose first source that exists in document order
      const src = (picture.querySelector('img')?.src) || picture.querySelector('source')?.srcset;
      if(!src) { info.textContent = 'No image source found.'; return; }
      info.textContent = 'Fetching size...';
      const size = await getImageSize(src);
      info.textContent = `Displayed file size: ${humanFileSize(size)}`;
    });
  }

  const btnBoth = document.getElementById('btn-get-sizes');
  const sizeResults = document.getElementById('size-results');
  if(btnBoth && sizeResults){
    btnBoth.addEventListener('click', async () => {
      const left = document.getElementById('left-img')?.src;
      const right = document.getElementById('right-img')?.src;
      sizeResults.textContent = 'Fetching...';
      const [l, r] = await Promise.all([getImageSize(left), getImageSize(right)]);
      sizeResults.textContent = `Left: ${humanFileSize(l)} | Right: ${humanFileSize(r)}`;
    });
  }
}

/* ========== Download displayed picture (index/comparison) ========== */
function setupDownloadButton(){
  const btn = document.getElementById('btn-download');
  if(!btn) return;
  btn.addEventListener('click', async () => {
    // find displayed img inside #picture-sample
    const picture = document.getElementById('picture-sample');
    const imgElement = picture.querySelector('img') || picture.querySelector('source');
    const src = imgElement?.src || imgElement?.srcset;
    if(!src) return alert('No image to download');

    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const filename = src.split('/').pop().split('?')[0];
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err){
      console.error(err);
      alert('Download failed (maybe blocked locally). Try deploying the site or use a hosted image.');
    }
  });
}
