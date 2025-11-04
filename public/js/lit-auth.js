import { LitAuthClient } from '@lit-protocol/lit-auth-client';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

const usernameInput = document.getElementById('username');
const registerButton = document.getElementById('register-button');
const loginButton = document.getElementById('login-button');
const litAuthContainer = document.getElementById('lit-auth-container');
const canvas = document.getElementById('renderCanvas');
const videoContainer = document.getElementById('video-container');

const litNodeClient = new LitNodeClient({
  litNetwork: 'cayenne',
  debug: true,
});
const litAuthClient = new LitAuthClient({
  litNodeClient,
  litRelayConfig: {
    relayApiKey: 'test-api-key',
  }
});

async function main() {
  await litNodeClient.connect();

  registerButton.addEventListener('click', async () => {
    const username = usernameInput.value;
    if (!username) {
      alert('Please enter a username');
      return;
    }

    const session = await litAuthClient.register(username);

    if (session) {
      const { pkpPublicKey } = session;

      const resp = await fetch('/lit-auth/associate-pkp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, pkpPublicKey }),
      });

      const json = await resp.json();

      if (json.success) {
        alert('Registration successful!');
      } else {
        alert(`Registration failed: ${json.message}`);
      }
    }
  });

  loginButton.addEventListener('click', async () => {
    const username = usernameInput.value;
    if (!username) {
      alert('Please enter a username');
      return;
    }

    const resp = await fetch(`/lit-auth/pkp?username=${username}`);
    const json = await resp.json();

    if (!json.success) {
      alert(`Login failed: ${json.message}`);
      return;
    }

    const { pkpPublicKey } = json;

    const session = await litAuthClient.authenticate(pkpPublicKey);

    if (session) {
      alert('Login successful!');
      litAuthContainer.style.display = 'none';
      canvas.style.display = 'block';
      videoContainer.style.display = 'flex';
      // Call the main Babylon.js function
      window.main();
    } else {
      alert('Login failed');
    }
  });
}

main();
