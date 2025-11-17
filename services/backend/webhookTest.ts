import dotenv from 'dotenv';


dotenv.config({

});

import crypto from 'crypto';
import fetch from 'node-fetch'; // npm install node-fetch@3

// Use env vars and validate them
const url = process.env.WEBHOOK_TEST_URL;
const secret = process.env.TOMORROW_WEBHOOK_SECRET;

if (!url) {
  throw new Error('Missing WEBHOOK_TEST_URL in environment. Add it to your .env or env.');
}
if (!secret) {
  throw new Error('Missing TOMORROW_WEBHOOK_SECRET in environment. Add it to your .env or env.');
}

async function main() {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const sig = crypto
        .createHmac('sha256', secret)
        .update(timestamp)
        .digest('hex');

    const header = `t=${timestamp},sig=${sig}`;

    const payload = {
        test: true,
        message: 'Hello from local test',
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Signature': header,
        },
        body: JSON.stringify(payload),
    });

    console.log('Status:', res.status);
    console.log('Body:', await res.text());
}

main().catch(console.error);
