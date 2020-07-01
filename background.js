import { loadPullRequests, loadLogin } from "./api.js"

function openGitHub() { window.open("https://github.com/pulls/review-requested") }
function openOptions() { chrome.runtime.openOptionsPage() }
function refreshAlarmListener(event) { event.name === 'refresh' && loadAccessTokenAndInitialize() }

function setBadgeListener(callback) {
  chrome.browserAction.onClicked.removeListener(openGitHub)
  chrome.browserAction.onClicked.removeListener(openOptions)
  chrome.browserAction.onClicked.addListener(callback)
}

function setBadgeCounter(count) {
  chrome.browserAction.setBadgeText({ text: count === 0 ? '' : count > 99 ? '99+' : count.toString() })
  chrome.browserAction.setBadgeBackgroundColor({ color: "#1E88E5" })
  chrome.alarms.clear("refresh")
  chrome.alarms.create('refresh', { periodInMinutes: 1 })
  chrome.alarms.onAlarm.removeListener(refreshAlarmListener)
  chrome.alarms.onAlarm.addListener(refreshAlarmListener)
  setBadgeListener(openGitHub)
}

function setBadgeError() {
  chrome.browserAction.setBadgeText({ text: "!" })
  chrome.browserAction.setBadgeBackgroundColor({ color: "#E53935" })
  chrome.alarms.clear("refresh")
  chrome.storage.sync.remove("accessToken")
  setBadgeListener(openOptions)
}

function setBadgeOffline() {
  chrome.browserAction.setBadgeText({ text: "Off" })
  chrome.browserAction.setBadgeBackgroundColor({ color: "#666666" })
  chrome.alarms.clear("refresh")
  setBadgeListener(openGitHub)
}

function initializeChecker(accessToken) {
  return loadLogin(accessToken)
    .then(async response => {
      if (response.status === 200) {
        const json = await response.json()
        return loadPullRequests(accessToken, json.data.viewer.login)
      } else if (response.status === 401) {
        setBadgeError()
      }
    })
    .then(async response => {
      if (response.status === 200) {
        const json = await response.json()
        setBadgeCounter(json.data.search.issueCount)
      } else if (response.status === 401) {
      setBadgeError()
      }
    })
}

function loadAccessTokenAndInitialize() {
  chrome.storage.sync.get(['accessToken'], function(result) {
    if (result.accessToken != undefined) {
      initializeChecker(result.accessToken)
    } else {
      setBadgeError()
    }
  });
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.accessToken != undefined) {
      chrome.storage.sync.set({accessToken: request.accessToken}, function() {
        initializeChecker(request.accessToken)
          .then(() => sendResponse({success: true, error: null}))
          .catch(error => sendResponse({success: false, error: error.message}))
      });
    }
    return true
  }
);

window.addEventListener('online', loadAccessTokenAndInitialize);
window.addEventListener('offline', setBadgeOffline);

loadAccessTokenAndInitialize()
