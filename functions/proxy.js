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
        // Decode the URL before passing it to axios
        const decodedUrl = decodeURIComponent(url);
        console.log('Proxying request to:', decodedUrl); // 日志输出解码后的URL

        const response = await axios.get(decodedUrl, {
            headers: {
                'Cache-Control': 'no-cache', // 禁用缓存
            }
        });

        console.log('Received response:', response.data); // 日志输出响应内容

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
