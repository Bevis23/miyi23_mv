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
        // 解码 URL 以确保正确传递
        const decodedUrl = decodeURIComponent(url);
        console.log('Decoded URL:', decodedUrl);

        const response = await axios.get(decodedUrl, {
            headers: {
                'Cache-Control': 'no-cache', // 禁用缓存
            }
        });

        console.log('API Response:', response.data);

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
