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
  })
}
