class API {
  #headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-App-Name': 'AI Storytime'
  }

  constructor( apiBaseUrl = 'https://api.funtility.com/') {
      this.apiBaseUrl = apiBaseUrl;
  }

  async postAppLog(message) {
    // remove any whitespace from the message
    message = message.trim();
    if (!message) {
      alert('Message cannot be empty');
      return;
    }
    await fetch(this.apiBaseUrl + 'log/app', {
        method: 'POST',
        headers: this.#headers,
        body: JSON.stringify(message)
    });
  }
}