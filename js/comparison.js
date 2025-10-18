
function initCompare(boxId, overlayId, handleId) {
  const box = document.getElementById(boxId);
  const overlay = document.getElementById(overlayId);
  const handle = document.getElementById(handleId);
  let isDragging = false;

  const startDrag = (e) => {
    isDragging = true;
    // Add a class to prevent text selection and show drag cursor
    document.body.classList.add('is-dragging');
    // Stop any momentum scrolling on touch devices
    e.preventDefault();
    moveDrag(e);
  };

  const stopDrag = () => {
    isDragging = false;
    document.body.classList.remove('is-dragging');
  };

  const moveDrag = (e) => {
    if (!isDragging) return;

    // Use pageX for mouse events and touches[0].pageX for touch events
    const x = e.touches ? e.touches[0].pageX : e.pageX;
    const rect = box.getBoundingClientRect();
    
    // Calculate position relative to the element, accounting for page scroll
    let pos = x - rect.left - window.scrollX;

    // Clamp the position within the box boundaries
    if (pos < 0) pos = 0;
    if (pos > rect.width) pos = rect.width;

    overlay.style.width = pos + 'px';
    handle.style.left = pos + 'px';
  };

  // Mouse events
  handle.addEventListener('mousedown', startDrag);
  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('mousemove', moveDrag);

  // Touch events
  handle.addEventListener('touchstart', startDrag, { passive: false });
  window.addEventListener('touchend', stopDrag);
  window.addEventListener('touchmove', moveDrag, { passive: false });
}

async function getImageSize(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
    const blob = await res.blob();
    return (blob.size / 1024).toFixed(1) + ' KB';
  } catch (err) {
    console.error('Error fetching image size:', err);
    return 'N/A';
  }
}

function setupFormatControls(leftSelId, rightSelId, leftImgId, rightImgId, leftLblId, rightLblId, outId) {
  const leftSelect = document.getElementById(leftSelId);
  const rightSelect = document.getElementById(rightSelId);
  const leftImage = document.getElementById(leftImgId);
  const rightImage = document.getElementById(rightImgId);
  const leftLabel = document.getElementById(leftLblId);
  const rightLabel = document.getElementById(rightLblId);
  const sizeOutput = document.getElementById(outId);

  const getFileExtension = (path) => path.split('.').pop().toUpperCase();

  const updateImageAndSize = async () => {
    sizeOutput.textContent = 'Loading...';
    const [leftSize, rightSize] = await Promise.all([
      getImageSize(leftImage.src),
      getImageSize(rightImage.src)
    ]);
    sizeOutput.textContent = `Left: ${leftSize} | Right: ${rightSize}`;
  };

  leftSelect.addEventListener('change', () => {
    leftImage.src = leftSelect.value;
    leftLabel.textContent = getFileExtension(leftSelect.value);
    updateImageAndSize();
  });

  rightSelect.addEventListener('change', () => {
    rightImage.src = rightSelect.value;
    rightLabel.textContent = getFileExtension(rightSelect.value);
    updateImageAndSize();
  });

  // Initial load
  updateImageAndSize();
}

document.addEventListener('DOMContentLoaded', () => {
  initCompare('photoBox', 'photoOverlay', 'photoHandle');
  initCompare('graphicBox', 'graphicOverlay', 'graphicHandle');

  setupFormatControls(
    'leftPhotoSelect', 'rightPhotoSelect',
    'photoLeft', 'photoRight',
    'labelPhotoLeft', 'labelPhotoRight',
    'photoSizeOut'
  );

  setupFormatControls(
    'leftGraphicSelect', 'rightGraphicSelect',
    'graphicLeft', 'graphicRight',
    'labelGraphicLeft', 'labelGraphicRight',
    'graphicSizeOut'
  );
});
