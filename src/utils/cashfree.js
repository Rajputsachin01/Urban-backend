const { Cashfree } = require('@cashfreepayments/cashfree-pg');

Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET;
Cashfree.XEnvironment = process.env.CASHFREE_ENVIRONMENT || "TEST"; // or "PROD"

module.exports = Cashfree;
