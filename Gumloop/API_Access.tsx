const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer d92a7ed2102c4bd7bc5124d1bb6b6893'
    },
    body: JSON.stringify({"input":""})
};

fetch('https://api.gumloop.com/api/v1/start_pipeline?user_id=EpzVqhAWnxMGN7owwJrVemrIm4t1&saved_item_id=tUpoNWoTgHCxgQtNkTgKFQ', options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));