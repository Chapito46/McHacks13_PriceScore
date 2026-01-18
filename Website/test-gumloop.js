import axios from 'axios';

const BASE_URL = 'https://api.gumloop.com/api/v1/start_pipeline';
const API_KEY = 'd01459e6a0714948a3927e1bb3387793';
const USER_ID = 'dFiBhOuKqYclRLqEnmpdKXTMDyz1';
const SAVED_ITEM_ID = 'b6Sq9zNYdaWSr8hDSZzM7k';

console.log('🧪 Testing Different Gumloop Request Formats...\n');

// Format 1: Array with object containing search_query
const format1 = {
    api_key: API_KEY,
    user_id: USER_ID,
    saved_item_id: SAVED_ITEM_ID,
    inputs: [{ search_query: 'lebron jersey' }]
};

// Format 2: Flat inputs as key-value
const format2 = {
    api_key: API_KEY,
    user_id: USER_ID,
    saved_item_id: SAVED_ITEM_ID,
    search_query: 'lebron jersey'
};

// Format 3: inputs as object (not array)
const format3 = {
    api_key: API_KEY,
    user_id: USER_ID,
    saved_item_id: SAVED_ITEM_ID,
    inputs: { search_query: 'lebron jersey' }
};

// Format 4: With pipeline_inputs key
const format4 = {
    api_key: API_KEY,
    user_id: USER_ID,
    saved_item_id: SAVED_ITEM_ID,
    pipeline_inputs: { search_query: 'lebron jersey' }
};

const formats = [
    { name: 'Format 1 (Array with object)', data: format1 },
    { name: 'Format 2 (Flat key-value)', data: format2 },
    { name: 'Format 3 (Object inputs)', data: format3 },
    { name: 'Format 4 (pipeline_inputs)', data: format4 }
];

for (const format of formats) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📤 Testing: ${format.name}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log('Payload:', JSON.stringify(format.data, null, 2));

    try {
        const response = await axios.post(BASE_URL, format.data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            timeout: 30000
        });

        console.log('✅ SUCCESS!');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        console.log('\n🎉 This format works! Use this one.');
        break; // Stop if we found a working format

    } catch (error) {
        console.log('❌ FAILED');
        console.log('Status:', error.response?.status || 'No response');
        console.log('Error:', error.response?.data || error.message);
    }

    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
}

console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Testing complete! Check above for working format.');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
