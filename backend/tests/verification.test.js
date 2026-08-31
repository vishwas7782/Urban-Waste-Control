
process.env.JWT_SECRET = 'test_secret_for_workflow';
process.env.MONGO_URI = 'mongodb://localhost:27017/UwcVerifyTest';
process.env.NODE_ENV = 'test';

const http = require('http');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

let port;
const call = (method, path, { token, body } = {}) =>
    new Promise((resolve) => {
        const payload = body ? JSON.stringify(body) : null;
        const headers = {};
        if (payload) {
            headers['Content-Type'] = 'application/json';
            headers['Content-Length'] = Buffer.byteLength(payload);
        }
        if (token) headers.Authorization = `Bearer ${token}`;
        const req = http.request({ port, path, method, headers }, (res) => {
            let d = '';
            res.on('data', (c) => (d += c));
            res.on('end', () => {
                let parsed = d;
                try { parsed = JSON.parse(d); } catch { /* leave raw */ }
                resolve({ status: res.statusCode, body: parsed });
            });
        });
        if (payload) req.write(payload);
        req.end();
    });

let passed = 0;
let failed = 0;
const check = (name, cond, detail) => {
    if (cond) { passed++; console.log(`  PASS  ${name}`); }
    else { failed++; console.log(`  FAIL  ${name}${detail ? ` -> ${JSON.stringify(detail)}` : ''}`); }
};

(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    await db.dropDatabase();

    const User = require('../src/models/User');
    const Concern = require('../src/models/Concern');
    const Garbage = require('../src/models/Garbage');
    const PublicGarbage = require('../src/models/PublicGarbage');

    const hash = await bcrypt.hash('Test@123', 10);
    const citizen = await User.create({ name: 'Citizen', email: 'c@t.com', password: hash, role: 'user', verified: true });
    const other = await User.create({ name: 'Other', email: 'o@t.com', password: hash, role: 'user', verified: true });
    const employee = await User.create({ name: 'Emp', email: 'e@t.com', password: hash, role: 'municipal', verified: true });
    const tok = (u) => jwt.sign({ userId: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const cTok = tok(citizen), oTok = tok(other), eTok = tok(employee);

    const server = app.listen(0);
    await new Promise((r) => server.once('listening', r));
    port = server.address().port;

    console.log('\n--- CONCERN: full happy path with a rejection round ---');
    await call('POST', '/raise-concern', { token: cTok, body: { name: 'C', houseNumber: '1', locality: 'Area', mobileNum: '9999999999', issueType: 'Missed pickup', additionalDetails: 'x' } });
    let concern = await Concern.findOne({ userId: citizen._id });
    check('concern starts pending', concern.status === 'pending', concern.status);

    let r = await call('PATCH', `/mark-solved/${concern._id}`, { token: eTok });
    concern = await Concern.findById(concern._id);
    check('employee mark-solved -> awaiting-verification', r.status === 200 && concern.status === 'awaiting-verification', { r: r.status, s: concern.status });
    check('resolvedBy recorded', String(concern.resolvedBy) === String(employee._id));

    r = await call('DELETE', `/delete-concern/${concern._id}`, { token: eTok });
    check('delete blocked while awaiting verification (409)', r.status === 409, r);

    r = await call('PATCH', `/verify-concern/${concern._id}`, { token: eTok, body: { confirmed: true } });
    check('employee cannot verify own work (403)', r.status === 403, r.status);

    r = await call('PATCH', `/verify-concern/${concern._id}`, { token: oTok, body: { confirmed: true } });
    check('other citizen cannot verify someone else\'s concern (403)', r.status === 403, r.status);

    r = await call('GET', '/pending-verifications', { token: cTok });
    check('owner sees it in pending-verifications', r.status === 200 && r.body.concerns.length === 1, r.body);
    check(
        'pending-verifications names the employee who marked it fixed',
        r.body.concerns[0]?.resolvedBy?.name === 'Emp',
        r.body.concerns[0]?.resolvedBy
    );

    r = await call('GET', '/view-concerns', { token: eTok });
    const listed = r.body.concerns?.find((x) => String(x._id) === String(concern._id));
    check('municipal list populates resolvedBy name', listed?.resolvedBy?.name === 'Emp', listed?.resolvedBy);

    r = await call('PATCH', `/verify-concern/${concern._id}`, { token: cTok, body: { confirmed: false, comment: 'Still dirty' } });
    concern = await Concern.findById(concern._id);
    check('citizen rejection -> back to pending', r.status === 200 && concern.status === 'pending', { r: r.status, s: concern.status });
    check('reopenCount incremented', concern.reopenCount === 1, concern.reopenCount);
    check('rejection comment stored', concern.reopenHistory[0]?.comment === 'Still dirty', concern.reopenHistory);
    check('resolvedBy cleared on reopen', !concern.resolvedBy);

    await call('PATCH', `/mark-solved/${concern._id}`, { token: eTok });
    r = await call('PATCH', `/verify-concern/${concern._id}`, { token: cTok, body: { confirmed: true, comment: 'All clean now' } });
    concern = await Concern.findById(concern._id);
    check('citizen confirmation -> verified', r.status === 200 && concern.status === 'verified', { r: r.status, s: concern.status });
    check('verifiedBy recorded', String(concern.verifiedBy) === String(citizen._id));

    r = await call('GET', '/view-concerns', { token: eTok });
    const verifiedRow = r.body.concerns?.find((x) => String(x._id) === String(concern._id));
    check('municipal list populates verifiedBy name', verifiedRow?.verifiedBy?.name === 'Citizen', verifiedRow?.verifiedBy);
    check('verification comment surfaced to the employee', verifiedRow?.verificationComment === 'All clean now', verifiedRow?.verificationComment);

    r = await call('PATCH', `/verify-concern/${concern._id}`, { token: cTok, body: { confirmed: true } });
    check('cannot verify twice (409)', r.status === 409, r.status);

    r = await call('DELETE', `/delete-concern/${concern._id}`, { token: eTok });
    check('delete allowed after verification', r.status === 200, r);
    check('concern actually gone', (await Concern.findById(concern._id)) === null);

    console.log('\n--- GARBAGE REPORT: reporter verifies ---');
    const g = await Garbage.create({ userId: citizen._id, reportLocation: 'Street', status: 'pending' });
    await call('PATCH', `/mark-solved-garbage/${g._id}`, { token: eTok });
    r = await call('DELETE', `/delete-garbage/${g._id}`, { token: eTok });
    check('garbage delete blocked before verification', r.status === 409, r.status);
    r = await call('PATCH', `/verify-garbage/${g._id}`, { token: oTok, body: { confirmed: true } });
    check('non-reporter blocked on owned report (403)', r.status === 403, r.status);
    r = await call('PATCH', `/verify-garbage/${g._id}`, { token: cTok, body: { confirmed: true } });
    check('reporter verifies garbage report', r.status === 200 && (await Garbage.findById(g._id)).status === 'verified', r.status);
    r = await call('DELETE', `/delete-garbage/${g._id}`, { token: eTok });
    check('garbage delete allowed after verification', r.status === 200, r.status);

    console.log('\n--- GARBAGE REPORT: legacy row with no reporter ---');
    const orphan = await Garbage.create({ reportLocation: 'Old', status: 'pending' });
    await call('PATCH', `/mark-solved-garbage/${orphan._id}`, { token: eTok });
    r = await call('GET', '/pending-verifications', { token: oTok });
    check('orphan report offered to any citizen', r.body.reports.some((x) => String(x._id) === String(orphan._id)), r.body.reports.length);
    r = await call('PATCH', `/verify-garbage/${orphan._id}`, { token: oTok, body: { confirmed: true } });
    check('any citizen may verify an orphan report', r.status === 200, r.status);

    console.log('\n--- ANONYMOUS PUBLIC REPORT: any citizen verifies ---');
    const p = await PublicGarbage.create({ publicReportLocation: 'Park', status: 'pending' });
    await call('PATCH', `/mark-solved-public-garbage/${p._id}`, { token: eTok });
    r = await call('DELETE', `/delete-public-garbage/${p._id}`, { token: eTok });
    check('public delete blocked before verification', r.status === 409, r.status);
    r = await call('GET', '/pending-verifications', { token: oTok });
    check('public report listed for any citizen', r.body.publicReports.some((x) => String(x._id) === String(p._id)));
    r = await call('PATCH', `/verify-public-garbage/${p._id}`, { token: oTok, body: { confirmed: true } });
    check('any citizen verifies anonymous report', r.status === 200 && (await PublicGarbage.findById(p._id)).status === 'verified', r.status);
    r = await call('DELETE', `/delete-public-garbage/${p._id}`, { token: eTok });
    check('public delete allowed after verification', r.status === 200, r.status);

    console.log('\n--- LEGACY "resolved" rows are grandfathered as deletable ---');
    const legacy = await Concern.create({ userId: citizen._id, issueType: 'Old', status: 'resolved' });
    r = await call('DELETE', `/delete-concern/${legacy._id}`, { token: eTok });
    check('legacy resolved concern deletable immediately', r.status === 200, r);
    const legacyG = await Garbage.create({ reportLocation: 'Old', status: 'resolved' });
    r = await call('DELETE', `/delete-garbage/${legacyG._id}`, { token: eTok });
    check('legacy resolved garbage deletable immediately', r.status === 200, r.status);

    console.log('\n--- EDGE CASES ---');
    const fresh = await Concern.create({ userId: citizen._id, issueType: 'Fresh', status: 'pending' });
    r = await call('PATCH', `/verify-concern/${fresh._id}`, { token: cTok, body: { confirmed: true } });
    check('cannot verify something not yet marked resolved (409)', r.status === 409, r.status);
    r = await call('DELETE', `/delete-concern/${fresh._id}`, { token: eTok });
    check('cannot delete a pending concern (409)', r.status === 409, r.status);
    await call('PATCH', `/mark-solved/${fresh._id}`, { token: eTok });
    r = await call('PATCH', `/mark-solved/${fresh._id}`, { token: eTok });
    check('double mark-solved rejected (409)', r.status === 409, r.status);
    r = await call('PATCH', `/verify-concern/${fresh._id}`, { token: cTok, body: {} });
    check('missing "confirmed" field rejected (400)', r.status === 400, r.status);
    r = await call('PATCH', '/verify-concern/000000000000000000000000', { token: cTok, body: { confirmed: true } });
    check('unknown id -> 404', r.status === 404, r.status);
    r = await call('PATCH', '/verify-concern/not-an-id', { token: cTok, body: { confirmed: true } });
    check('malformed id -> 404 not 500', r.status === 404, r.status);
    r = await call('GET', '/pending-verifications', {});
    check('pending-verifications requires auth (401)', r.status === 401, r.status);
    r = await call('GET', '/pending-verifications', { token: eTok });
    check('pending-verifications is citizen-only (403)', r.status === 403, r.status);

    console.log(`\n=== ${passed} passed, ${failed} failed ===`);
    await db.dropDatabase();
    await mongoose.disconnect();
    server.close();
    process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('TEST CRASHED:', e); process.exit(1); });
