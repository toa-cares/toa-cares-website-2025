import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(morgan('dev'));
app.use(cors());

// Webhook route first with raw body for signature verification
app.post('/webhook/doku', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const rawBody = req.body instanceof Buffer ? req.body.toString('utf8') : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    const headers = req.headers;

    const clientIdHeader = headers['client-id'];
    const requestId = headers['request-id'];
    const requestTimestamp = headers['request-timestamp'];
    const signatureHeader = headers['signature'];
    const digestHeader = headers['digest'];

    if (!clientIdHeader || !requestId || !requestTimestamp || !signatureHeader || !digestHeader) {
      return res.status(400).send('Missing headers');
    }

    const computedDigest = crypto.createHash('sha256').update(rawBody).digest('base64');
    const expectedDigest = (digestHeader || '').replace('SHA-256=', '');
    if (computedDigest !== expectedDigest) {
      return res.status(400).send('Invalid digest');
    }

    const requestPath = '/webhook/doku';
    const stringToSign = [
      `Client-Id:${process.env.DOKU_CLIENT_ID}`,
      `Request-Id:${requestId}`,
      `Request-Timestamp:${requestTimestamp}`,
      `Request-Target:${requestPath}`,
      `Digest:SHA-256=${computedDigest}`,
    ].join('\n');

    const computedSignature = crypto.createHmac('sha256', process.env.DOKU_SECRET_KEY || '').update(stringToSign).digest('base64');
    const incomingSignature = (signatureHeader || '').replace('HMACSHA256=', '');

    if (computedSignature !== incomingSignature) {
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(rawBody);
    const invoiceNumber = event?.order?.invoice_number || event?.invoice_number;
    const status = event?.transaction?.status || event?.status || 'UNKNOWN';

    if (invoiceNumber && donations.has(invoiceNumber)) {
      const donation = donations.get(invoiceNumber);
      donation.status = status;
      donation.updatedAt = new Date().toISOString();
      donations.set(invoiceNumber, donation);
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(500).send('ERROR');
  }
});

// General parsers for other routes
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID || '';
const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY || '';
const DOKU_BASE_URL = process.env.DOKU_BASE_URL || 'https://api-sandbox.doku.com';
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;

if (!DOKU_CLIENT_ID || !DOKU_SECRET_KEY) {
  console.warn('[WARN] DOKU_CLIENT_ID or DOKU_SECRET_KEY not set. API calls will fail until configured.');
}

function buildDokuSignatureHeaders({ requestPath, bodyString }) {
  const requestId = uuidv4();
  const requestTimestamp = new Date().toISOString();
  const sha256 = crypto.createHash('sha256').update(bodyString).digest('base64');
  const digestHeader = `SHA-256=${sha256}`;
  const stringToSign = [
    `Client-Id:${DOKU_CLIENT_ID}`,
    `Request-Id:${requestId}`,
    `Request-Timestamp:${requestTimestamp}`,
    `Request-Target:${requestPath}`,
    `Digest:${digestHeader}`,
  ].join('\n');
  const hmacSignature = crypto.createHmac('sha256', DOKU_SECRET_KEY).update(stringToSign).digest('base64');
  const signatureHeader = `HMACSHA256=${hmacSignature}`;
  return {
    'Client-Id': DOKU_CLIENT_ID,
    'Request-Id': requestId,
    'Request-Timestamp': requestTimestamp,
    'Signature': signatureHeader,
    'Digest': digestHeader,
    'Content-Type': 'application/json',
  };
}

// In-memory store for demo
const donations = new Map();

app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/api/donations', async (req, res) => {
  try {
    const { amount, name, email, phone } = req.body || {};
    const numericAmount = Number(amount);
    if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const invoiceNumber = `DN-${Date.now()}`;
    const pathOnly = '/checkout/v1/payment';

    const payload = {
      order: {
        amount: numericAmount,
        invoice_number: invoiceNumber,
        currency: 'IDR',
        line_items: [
          { name: 'Donation', price: numericAmount, quantity: 1 }
        ],
        callback_url: `${PUBLIC_BASE_URL}/donation-status.html`,
        failed_url: `${PUBLIC_BASE_URL}/donation-failed.html`,
        success_url: `${PUBLIC_BASE_URL}/donation-success.html`
      },
      customer: {
        name: name || 'Donor',
        email: email || 'donor@example.com',
        phone: phone || '080000000000'
      },
      payment: {
        payment_due_date: 60
      }
    };

    const bodyString = JSON.stringify(payload);
    const headers = buildDokuSignatureHeaders({ requestPath: pathOnly, bodyString });

    const url = `${DOKU_BASE_URL}${pathOnly}`;
    const { data } = await axios.post(url, bodyString, { headers });

    const paymentUrl = data?.payment?.url || data?.payment_url || data?.checkout_url;

    donations.set(invoiceNumber, {
      status: 'CREATED',
      amount: numericAmount,
      name,
      email,
      phone,
      paymentUrl,
      createdAt: new Date().toISOString(),
    });

    if (!paymentUrl) {
      return res.status(502).json({ error: 'Failed to get payment URL from DOKU', raw: data });
    }

    return res.json({ invoiceNumber, paymentUrl });
  } catch (err) {
    console.error('Error creating donation:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Internal error', detail: err.response?.data || err.message });
  }
});

app.get('/api/donations/:invoiceNumber', (req, res) => {
  const invoiceNumber = req.params.invoiceNumber;
  const donation = donations.get(invoiceNumber);
  if (!donation) return res.status(404).json({ error: 'Not found' });
  res.json(donation);
});

app.get('/health', (_, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
