const axios = require('axios');

exports.handler = async function (event, context) {
    const { url } = event.queryStringParameters;

    if (!url) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'URL parameter is required' }),
        };
    }

    try {
        const response = await axios.get(url);
        return {
            statusCode: 200,
            body: JSON.stringify(response.data),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };
    } catch (error) {
        console.error('Error fetching data:', error); // 输出详细错误信息
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed fetching data', details: error.message }),
        };
    }
};
