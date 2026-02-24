// PhishGuard Sentinel - Background Worker
// Handles real-time monitoring and threat logging

chrome.runtime.onInstalled.addListener(() => {
    console.log("PhishGuard Sentinel Initialized.");
    chrome.storage.local.set({ scanCount: 0, blockCount: 0 });
});

// Update scan count on every new tab navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
        chrome.storage.local.get(['scanCount'], (result) => {
            chrome.storage.local.set({ scanCount: (result.scanCount || 0) + 1 });
        });
    }
});
