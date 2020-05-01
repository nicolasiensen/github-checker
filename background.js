import { loadPullRequests, loadLogin } from "./api.js"

function openGitHub() { window.open("https://github.com/pulls/review-requested") }
function openOptions() { chrome.runtime.openOptionsPage() }

function setBadgeListener(callback) {
  chrome.browserAction.onClicked.removeListener(openGitHub)
  chrome.browserAction.onClicked.removeListener(openOptions)
  chrome.browserAction.onClicked.addListener(callback)
}

function setBadgeCounter(count) {
  chrome.browserAction.setBadgeText({ text: count === 0 ? '' : count > 99 ? '99+' : count.toString() })
  chrome.browserAction.setBadgeBackgroundColor({ color: "#1E88E5" })
  setBadgeListener(openGitHub)
}

function setBadgeError() {
  chrome.browserAction.setBadgeText({ text: "!" })
  chrome.browserAction.setBadgeBackgroundColor({ color: "#E53935" })
  setBadgeListener(openOptions)
}

async function initializeChecker(accessToken) {
  return loadLogin(accessToken)
    .then(data => loadPullRequests(accessToken, data.data.viewer.login))
    .then(data => setBadgeCounter(data.data.search.issueCount))
}

chrome.storage.sync.get(['accessToken'], function(result) {
  if (result.accessToken != undefined) {
    initializeChecker(result.accessToken).catch(() => setBadgeError())
  } else {
    setBadgeError()
  }
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.accessToken != undefined) {
      chrome.storage.sync.set({accessToken: request.accessToken}, function() {
        initializeChecker(request.accessToken)
          .then(() => sendResponse({success: true, error: null}))
          .catch(error => {
            setBadgeError()
            sendResponse({success: false, error: error.message})
          })
      });
    }
    return true
  }
);