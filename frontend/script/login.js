const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login');
const errorMessage = document.getElementById('error');

loginButton.onclick = () => {
  const username = usernameInput.value;
  const password = passwordInput.value;

  if (username && password) { // Make sure both values are provided
    const object = { username, password };

    fetch('/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(object),
    });
  } else {
    errorMessage[0].style.display = 'flex';
  }
};
