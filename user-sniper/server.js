const express = require('express');
const path = require('path');

let fetchFn;
if (typeof fetch === 'function') {
    fetchFn = fetch;
} else {
    try {

        fetchFn = require('node-fetch');
    } catch (e) {
        console.error('Please install node-fetch@2 (e.g. npm install node-fetch@2).');
        process.exit(1);
    }
}

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

async function checkRobloxUsername(username) {
    const url = 'https://users.roblox.com/v1/usernames/users';
    const body = JSON.stringify({
        usernames: [username],
        excludeBannedUsers: true
    });

    const res = await fetchFn(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body
    });

    let data = null;
    try {
        data = await res.json();
    } catch (e) {
        const txt = await res.text().catch(() => null);
        return { ok: false, error: 'invalid-json', raw: txt, status: res.status };
    }
    if (data && Array.isArray(data.data) && data.data.length > 0) {
        return { ok: true, taken: !!data.data[0].name, raw: data };
    }
    try {
        const bodyIncludeBanned = JSON.stringify({
            usernames: [username],
            excludeBannedUsers: false
        });
        const res2 = await fetchFn(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: bodyIncludeBanned
        });
        const data2 = await res2.json().catch(() => null);
        if (data2 && Array.isArray(data2.data) && data2.data.length > 0) {
            return { ok: true, taken: true, banned: true, raw: data2 };
        }
    } catch (e) {
        console.warn('Fallback check (include banned) failed:', e && e.message ? e.message : e);
    }

    return { ok: true, taken: false, raw: data };
}

app.get('/check', async (req, res) => {
    const username = req.query.username;
    if (!username) return res.status(400).json({ error: 'username required' });

    try {
        const result = await checkRobloxUsername(username);
        if (!result.ok) {
            return res.status(500).json({ error: 'bad_response', details: result });
        }
        if (result.taken) {
            return res.status(200).json({ taken: true, info: result.raw });
        } else {
            return res.status(404).json({ taken: false });
        }
    } catch (err) {
        console.error('Proxy error:', err);
        return res.status(500).json({ error: String(err) });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));