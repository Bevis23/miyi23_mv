const axios = require('axios');

exports.handler = async function (event) {
    const { url } = event.queryStringParameters;

    if (!url) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'URL parameter is required' }),
        };
    }

    try {
        const response = await axios.get(url, {
            headers: {
                // 可以添加更多头部信息
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify(response.data),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // 允许跨域请求
            },
        };
    } catch (error) {
        console.error('Error fetching data:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed fetching data', details: error.message }),
        };
    }
};
