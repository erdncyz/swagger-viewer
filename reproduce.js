import { convertSwagger2ToOpenApi3 } from './src/utils/swagger.js';

async function test() {
    const url = 'https://petstore.swagger.io/v2/swagger.json';
    console.log(`Fetching ${url}...`);
    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log('Original Swagger Version:', data.swagger);
        console.log('Original Host:', data.host);
        console.log('Original BasePath:', data.basePath);

        const converted = convertSwagger2ToOpenApi3(data);

        console.log('Converted Servers:', JSON.stringify(converted.servers, null, 2));

        if (converted.servers && converted.servers.length > 0 && converted.servers[0].url.includes('petstore.swagger.io')) {
            console.log('SUCCESS: Servers correctly populated.');
        } else {
            console.error('FAILURE: Servers missing or incorrect.');
        }

    } catch (error) {
        console.error('Error fetching or parsing:', error);
    }
}

test();
