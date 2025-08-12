import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import crypto from 'crypto';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Config
const PORT = process.env.PORT || 3000;
const DOKU_BASE_URL = process.env.DOKU_BASE_URL || 'https://api-sandbox.doku.com';
const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID || '';
const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY || '';

if (!DOKU_CLIENT_ID || !DOKU_SECRET_KEY) {
  console.warn('[WARN] DOKU credentials are not set. Set DOKU_CLIENT_ID and DOKU_SECRET_KEY in .env');
}

// Middleware
app.use(morgan('dev'));
app.use(cors());

// Ensure raw body is available for DOKU webhook before JSON parser
app.use('/api/webhooks/doku', express.raw({ type: '*/*' }));

app.use(express.json({ type: ['application/json', 'application/*+json'] }));

// Serve static site from repository root
const staticRoot = path.resolve(__dirname, '..');
app.use(express.static(staticRoot));

// Utility: RFC3339 timestamp without milliseconds
function getRequestTimestamp() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

// Utility: build Digest header value for JSON body
function buildDigestHeader(bodyString) {
  const hash = crypto.createHash('sha256').update(bodyString).digest('base64');
  return `SHA-256=${hash}`;
}

// Utility: build HTTP Signature header
function buildSignatureHeader({ clientId, requestId, requestTimestamp, requestTarget, digest, secretKey }) {
  const signatureComponents = [
    `Client-Id:${clientId}`,
    `Request-Id:${requestId}`,
    `Request-Timestamp:${requestTimestamp}`,
    `Request-Target:${requestTarget}`,
    `Digest:${digest}`
  ].join('\n');

  const hmac = crypto.createHmac('sha256', secretKey).update(signatureComponents).digest('base64');
  return `HMACSHA256=${hmac}`;
}

// Create DOKU Checkout session
app.post('/api/donations', async (req, res) => {
  try {
    const { amount, donorName, donorEmail, donorPhone, frequency } = req.body || {};

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const invoiceNumber = `DON-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    const successUrl = process.env.SUCCESS_URL || `${req.protocol}://${req.get('host')}/payment/success?invoice=${encodeURIComponent(invoiceNumber)}`;
    const failedUrl = process.env.FAILED_URL || `${req.protocol}://${req.get('host')}/payment/failed?invoice=${encodeURIComponent(invoiceNumber)}`;
    const callbackUrl = process.env.CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/webhooks/doku`;

    // DOKU Checkout body (adjust fields per your DOKU dashboard configuration)
    const dokuBody = {
      order: {
        amount: Number(amount),
        invoice_number: invoiceNumber,
        failed_url: failedUrl,
        success_url: successUrl,
        callback_url: callbackUrl,
        auto_redirect: true
      },
      payment: {
        payment_due_date: 60
      },
      customer: {
        name: donorName || 'Anonymous Donor',
        email: donorEmail || 'anonymous@example.com',
        phone: donorPhone || '081234567890'
      },
      metadata: {
        donation_frequency: frequency || 'one-time',
        project: 'TOA Cares'
      }
    };

    const bodyString = JSON.stringify(dokuBody);

    const requestId = uuidv4();
    const requestTimestamp = getRequestTimestamp();
    const requestTarget = '/checkout/v1/payment';
    const digest = buildDigestHeader(bodyString);
    const signature = buildSignatureHeader({
      clientId: DOKU_CLIENT_ID,
      requestId,
      requestTimestamp,
      requestTarget,
      digest,
      secretKey: DOKU_SECRET_KEY
    });

    const { data } = await axios.post(
      `${DOKU_BASE_URL}${requestTarget}`,
      dokuBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Client-Id': DOKU_CLIENT_ID,
          'Request-Id': requestId,
          'Request-Timestamp': requestTimestamp,
          'Request-Target': requestTarget,
          'Digest': digest,
          'Signature': signature
        },
        timeout: 20000
      }
    );

    const checkoutUrl = data?.checkout_url || data?.payment?.url || data?.payment?.payment_url || null;

    if (!checkoutUrl) {
      return res.status(502).json({ error: 'Failed to create checkout session', dokuResponse: data });
    }

    return res.json({ checkoutUrl, invoiceNumber });
  } catch (err) {
    console.error('Error creating DOKU session:', err?.response?.data || err.message);
    return res.status(500).json({ error: 'Internal error creating payment session', details: err?.response?.data || err.message });
  }
});

// DOKU webhook handler
app.post('/api/webhooks/doku', (req, res) => {
  try {
    const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(req.body || '');
    const bodyString = rawBody.toString('utf8');

    // Extract headers
    const clientId = req.header('Client-Id');
    const incomingSignature = req.header('Signature');
    const requestId = req.header('Request-Id');
    const requestTimestamp = req.header('Request-Timestamp');
    const requestTarget = req.header('Request-Target') || '/api/webhooks/doku';

    const digest = buildDigestHeader(bodyString);
    const expectedSignature = buildSignatureHeader({
      clientId: clientId || DOKU_CLIENT_ID,
      requestId: requestId || '',
      requestTimestamp: requestTimestamp || '',
      requestTarget,
      digest,
      secretKey: DOKU_SECRET_KEY
    });

    const isValid = incomingSignature === expectedSignature;

    // Log event; in production, update your donation record by invoice_number / transaction status
    try {
      const event = JSON.parse(bodyString || '{}');
      fs.appendFileSync(path.resolve(process.cwd(), 'doku-webhook.log'), `\n${new Date().toISOString()} | valid=${isValid} | ${bodyString}`);
      console.log('DOKU webhook received:', { isValid, event });
    } catch (_) {
      // ignore
    }

    // Always respond 200 to acknowledge
    return res.status(200).json({ received: true, valid: isValid });
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(200).json({ received: true });
  }
});

// Minimal success/failed pages
app.get('/payment/success', (req, res) => {
  const invoice = req.query.invoice || '';
  res.type('html').send(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Donation Successful</title><link rel="stylesheet" href="/styles.css"></head><body><div style="max-width:720px;margin:60px auto;text-align:center"><h1>Thank you!</h1><p>Your donation has been received.</p>${invoice ? `<p>Invoice: <strong>${invoice}</strong></p>` : ''}<p><a href="/" class="btn btn-primary">Back to Home</a></p></div></body></html>`);
});

app.get('/payment/failed', (req, res) => {
  const invoice = req.query.invoice || '';
  res.type('html').send(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Donation Failed</title><link rel="stylesheet" href="/styles.css"></head><body><div style="max-width:720px;margin:60px auto;text-align:center"><h1>Payment failed</h1><p>We could not complete your donation.</p>${invoice ? `<p>Invoice: <strong>${invoice}</strong></p>` : ''}<p><a href="/" class="btn btn-secondary">Try Again</a></p></div></body></html>`);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});