// PhishGuard Sentinel - Popup Script
document.addEventListener('DOMContentLoaded', () => {
    // Load stats from storage
    chrome.storage.local.get(['scanCount', 'blockCount'], (result) => {
        document.getElementById('scan-count').textContent = result.scanCount || 0;
        document.getElementById('block-count').textContent = result.blockCount || 0;
    });

    document.getElementById('analyze-btn').addEventListener('click', () => {
        const btn = document.getElementById('analyze-btn');
        btn.textContent = "SCANNING...";
        btn.disabled = true;

        setTimeout(() => {
            btn.textContent = "SCAN COMPLETE";
            btn.style.background = "#00ff9d";
            setTimeout(() => {
                btn.textContent = "MANUAL SCAN";
                btn.style.background = "#00f5ff";
                btn.disabled = false;
            }, 2000);
        }, 1500);
    });
});
