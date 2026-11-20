// Bridge for backwards-compatibility: DramaPlayer -> DramaDetailModal
// No video player or streaming needed as requested by user.

class DramaPlayer {
  constructor() {
    if (!window.detailModal) {
      window.detailModal = new DramaDetailModal();
    }
  }

  loadDrama(drama, epIndex = 0) {
    if (window.detailModal) {
      window.detailModal.open(drama, true);
    }
  }

  stopAndReset() {
    if (window.detailModal) {
      window.detailModal.close();
    }
  }

  showToast(msg) {
    if (window.detailModal) {
      window.detailModal.showToast(msg);
    }
  }
}

window.DramaPlayer = DramaPlayer;
