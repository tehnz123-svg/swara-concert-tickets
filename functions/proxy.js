const axios = require('axios');

exports.handler = async function (event, context) {
  try {
    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': 'https://swara-concert-tickets.netlify.app',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: ''
      };
    }

    // Parse incoming JSON body
    const body = JSON.parse(event.body);

    // Forward request to Google Apps Script
    const response = await axios.post(
      'https://script.google.com/macros/s/AKfycbyLFJOebiOiym8EcGXfFG3F-Z1hyYfRxgrgTADA0_mpWeF9X9dy1hMZdMexsTOpUmvk/exec',
      body,
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Return response with CORS headers
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://swara-concert-tickets.netlify.app',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Proxy error:', error.message);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://swara-concert-tickets.netlify.app',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ status: 'error', message: error.message })
    };
  }
};