export async function loadPullRequests(userToken, username) {
  return fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { 'Authorization': `bearer ${userToken}` },
    body: JSON.stringify(
      {
        query: `
          {
            search(
              query: \"is:open is:pr review-requested:${username} archived:false\",
              type: ISSUE,
              first: 10
            )
            { issueCount }
          }
        `
      }
    )
  }).then(response => {
    if (response.status < 400) {
      return response.json()
    } else {
      response.text().then(text => {
        throw new Error(`Response status: ${response.statusText}, response body: ${text}`)
      })
    }
  })
}

export async function loadLogin(userToken) {
  return fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { 'Authorization': `bearer ${userToken}` },
    body: JSON.stringify(
      {
        query: `
          {
            viewer {
              login
            }
          }
        `
      }
    )
  }).then(response => {
    if (response.status < 400) {
      return response.json()
    } else {
      response.text().then(text => {
        throw new Error(`Response status: ${response.statusText}, response body: ${text}`)
      })
    }
  })
}
