fetch('http://localhost:5173/forgotpassword', {  // Adjust URL if Flask is running on a different port
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Response from backend:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
