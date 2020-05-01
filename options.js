var successParagraph = document.getElementById("success-paragraph")
var failureParagraph = document.getElementById("failure-paragraph")
var loadingParagraph = document.getElementById("loading-paragraph")
var accessTokenInput = document.getElementById("access-token-input")

document.getElementById("access-token-form").addEventListener("submit", (event) => {
  event.preventDefault()

  failureParagraph.style.display = "none"
  successParagraph.style.display = "none"
  loadingParagraph.style.display = "block"

  accessToken = accessTokenInput.value
  chrome.storage.sync.set({accessToken}, function() {
    chrome.runtime.sendMessage({accessToken}, function(response) {
      if (response.success) {
        loadingParagraph.style.display = "none"
        successParagraph.style.display = "block"
        accessTokenInput.value = ""
      } else {
        failureParagraph.innerHTML = `Error requesting the API: ${response.error}`
        loadingParagraph.style.display = "none"
        failureParagraph.style.display = "block"
      }
    });
  });
})