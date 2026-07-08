import type { Payment, PaymentStatus, PaymentMethodType, CodRecord, FailedPayment } from '../types/payment';

const now = Date.now();
const hour = 60 * 60 * 1000;
const day = 24 * hour;

const customerNames = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh',
  'Anjali Nair', 'Suresh Babu', 'Meera Iyer', 'Ravi Teja', 'Kavitha Devi',
  'Mohammed Ali', 'Pooja Gupta', 'Arun Prasad', 'Divya Menon', 'Sanjay Mishra',
  'Lakshmi Rao', 'Kiran Kumar', 'Nisha Verma', 'Ramesh Chandra', 'Swathi Reddy',
  'Deepak Joshi', 'Padma Lakshmi', 'Ganesh Babu', 'Sravani Priya', 'Naveen Kumar',
  'Harika Devi', 'Bharath Reddy', 'Chandini Chowdary', 'Venu Gopal', 'Ramya Sri',
  'Srinivas Rao', 'Jyothi Prasad', 'Manoj Tiwari', 'Prashanthi Reddy', 'Venkateshwarlu',
  'Shravani Nimmala', 'Rajnish Kumar', 'Aishwarya Rai', 'Dinesh Chandra', 'Bhavana Singh',
  'Krishna Prasad', 'Mounika Reddy', 'Suresh Kumar', 'Lavanya Devi', 'Ashok Babu',
  'Sunitha Sharma', 'Prasad Reddy', 'Geeta Devi', 'Rajendra Prasad', 'Kamala Kannan',
];

const upiApps = ['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'Amazon Pay'];
const cardNetworks = ['Visa', 'Mastercard', 'RuPay'];
const banks = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank', 'PNB', 'Bank of Baroda'];
const failureReasons = [
  'Insufficient funds',
  'Card expired',
  'Transaction limit exceeded',
  'Authentication failed',
  'Network timeout',
  'Payment declined by bank',
  'Session expired',
  'Invalid UPI PIN',
  'Account blocked',
  'Daily limit exceeded',
];

const menuItems = [
  { name: 'Jonna Roti', price: 25 },
  { name: 'Chapathi', price: 20 },
  { name: 'Ragi Roti', price: 30 },
  { name: 'Bajra Roti', price: 28 },
  { name: 'Dal Tadka', price: 60 },
  { name: 'Paneer Curry', price: 80 },
  { name: 'Chicken Curry', price: 120 },
  { name: 'Egg Curry', price: 70 },
  { name: 'Mix Veg', price: 65 },
  { name: 'Sambar Rice', price: 55 },
  { name: 'Curd Rice', price: 50 },
  { name: 'Veg Biryani', price: 90 },
  { name: 'Chicken Biryani', price: 140 },
  { name: 'Gongura Chicken', price: 150 },
  { name: 'Mutton Curry', price: 180 },
  { name: 'Fish Fry', price: 160 },
  { name: 'Papad', price: 15 },
  { name: 'Pickle', price: 10 },
  { name: 'Buttermilk', price: 20 },
  { name: 'Sweet (Payasam)', price: 40 },
];

const deliverySlots = ['6:00 AM - 8:00 AM', '12:00 PM - 2:00 PM', '7:00 PM - 9:00 PM'];
const deliveryAddresses = [
  '42 Jubilee Hills Road No 36, Hyderabad',
  '15th Floor DLF Cyber City, HITEC City',
  '8-3-123 Ameerpet, Hyderabad',
  'Road No 10 Banjara Hills, Hyderabad',
  '5-9-123 Gachibowli, Hyderabad',
  '1-2-345 Kukatpally, Hyderabad',
  '7-8-90 Miyapur, Hyderabad',
  '3-4-567 Kompally, Hyderabad',
  '2-1-89 Nacharam, Hyderabad',
  '6-7-89 Uppal, Hyderabad',
];

const collectors = ['Rajesh (Delivery)', 'Suresh (Delivery)', 'Delivery Boy - Venkat', 'Rider - Prasad'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRazorpayOrderId(): string {
  return 'order_' + Array.from({ length: 14 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
}

function generateRazorpayPaymentId(): string {
  return 'pay_' + Array.from({ length: 14 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
}

function generatePaymentId(index: number): string {
  return `pay_txn_${String(index).padStart(5, '0')}`;
}

function generateOrderId(index: number): string {
  return `RDK-${1000 + index}`;
}

function generateTimeline(status: PaymentStatus, timestamp: number): Payment['timeline'] {
  const events: Payment['timeline'] = [
    { id: 'tl-1', type: 'order_created', label: 'Order Created', timestamp: timestamp - 5 * minute, status: 'completed' },
    { id: 'tl-2', type: 'payment_initiated', label: 'Payment Initiated', timestamp: timestamp - 4 * minute, status: 'completed' },
  ];

  if (status === 'paid' || status === 'authorized') {
    events.push({ id: 'tl-3', type: 'payment_authorized', label: 'Payment Authorized', timestamp: timestamp - 3 * minute, status: 'completed' });
  }
  if (status === 'paid') {
    events.push({ id: 'tl-4', type: 'payment_successful', label: 'Payment Successful', timestamp: timestamp - 2 * minute, status: 'completed' });
    events.push({ id: 'tl-5', type: 'order_accepted', label: 'Order Accepted', timestamp: timestamp - 1 * minute, status: 'current' });
    events.push({ id: 'tl-6', type: 'preparing', label: 'Preparing', timestamp: timestamp + 10 * minute, status: 'upcoming' });
    events.push({ id: 'tl-7', type: 'out_for_delivery', label: 'Out for Delivery', timestamp: timestamp + 30 * minute, status: 'upcoming' });
    events.push({ id: 'tl-8', type: 'delivered', label: 'Delivered', timestamp: timestamp + 60 * minute, status: 'upcoming' });
  } else if (status === 'failed') {
    events.push({ id: 'tl-3', type: 'payment_authorized', label: 'Payment Failed', timestamp: timestamp - 3 * minute, status: 'completed' });
  } else if (status === 'pending') {
    events.push({ id: 'tl-3', type: 'payment_authorized', label: 'Awaiting Confirmation', timestamp: timestamp - 3 * minute, status: 'current' });
  } else if (status === 'authorized') {
    events.push({ id: 'tl-3', type: 'payment_authorized', label: 'Payment Authorized', timestamp: timestamp - 3 * minute, status: 'current' });
  }

  return events;
}

const minute = 60 * 1000;

function createPayment(index: number, overrides?: Partial<Payment>): Payment {
  const status = overrides?.paymentStatus || generateStatus();
  const method = overrides?.paymentMethod || generateMethod(status);
  const amount = overrides?.amount || randomInt(80, 650);
  const timestamp = overrides?.transactionTime || (now - randomInt(0, 30) * day - randomInt(0, 23) * hour);
  const items = overrides?.items || generateItems(amount);
  const customerName = overrides?.customerName || randomItem(customerNames);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharges = 20;
  const discount = Math.round(subtotal * (randomInt(0, 10) / 100));
  const gst = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + deliveryCharges - discount + gst;

  const isRazorpay = method !== 'cod';

  return {
    id: `pmt-${String(index).padStart(4, '0')}`,
    paymentId: generatePaymentId(index),
    orderId: generateOrderId(index),
    customerName,
    customerPhone: `+91 ${randomInt(70000, 99999)} ${randomInt(10000, 99999)}`,
    customerEmail: `${customerName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
    amount,
    currency: 'INR',
    paymentMethod: method,
    paymentStatus: status,
    gateway: 'razorpay',
    transactionTime: timestamp,
    items,
    subtotal,
    deliveryCharges,
    discount,
    gst,
    grandTotal,
    deliverySlot: randomItem(deliverySlots),
    orderStatus: status === 'paid' ? 'preparing' : status === 'failed' ? 'cancelled' : 'placed',
    deliveryAddress: randomItem(deliveryAddresses),
    razorpayInfo: isRazorpay
      ? {
          orderId: generateRazorpayOrderId(),
          paymentId: generateRazorpayPaymentId(),
          gateway: 'razorpay',
          paymentMethod: method === 'upi' ? 'upi' : method === 'credit_card' ? 'card' : method === 'debit_card' ? 'card' : method === 'net_banking' ? 'netbanking' : 'wallet',
          bank: method !== 'upi' ? randomItem(banks) : undefined,
          upiApp: method === 'upi' ? randomItem(upiApps) : undefined,
          cardNetwork: (method === 'credit_card' || method === 'debit_card') ? randomItem(cardNetworks) : undefined,
          maskedCardNumber: (method === 'credit_card' || method === 'debit_card') ? `**** **** **** ${randomInt(1000, 9999)}` : undefined,
          transactionReference: `TXN${Date.now()}${randomInt(1000, 9999)}`,
          webhookStatus: status === 'paid' ? 'processed' : status === 'pending' ? 'pending' : 'error',
        }
      : null,
    timeline: generateTimeline(status, timestamp),
    ...overrides,
  };
}

function generateStatus(): PaymentStatus {
  const rand = Math.random();
  if (rand < 0.55) return 'paid';
  if (rand < 0.70) return 'pending';
  if (rand < 0.82) return 'failed';
  if (rand < 0.90) return 'authorized';
  if (rand < 0.95) return 'refunded';
  return 'cancelled';
}

function generateMethod(status: PaymentStatus): PaymentMethodType {
  if (status === 'pending' && Math.random() < 0.3) return 'cod';
  const rand = Math.random();
  if (rand < 0.35) return 'upi';
  if (rand < 0.50) return 'credit_card';
  if (rand < 0.65) return 'debit_card';
  if (rand < 0.80) return 'net_banking';
  if (rand < 0.90) return 'wallet';
  return 'cod';
}

function generateItems(totalAmount: number): { name: string; quantity: number; price: number }[] {
  const items: { name: string; quantity: number; price: number }[] = [];
  let remaining = totalAmount;
  const used = new Set<string>();

  while (remaining > 15 && items.length < 5) {
    const available = menuItems.filter((m) => !used.has(m.name) && m.price <= remaining);
    if (available.length === 0) break;
    const item = randomItem(available);
    used.add(item.name);
    const qty = randomInt(1, 3);
    items.push({ name: item.name, quantity: qty, price: item.price });
    remaining -= item.price * qty;
  }

  if (items.length === 0) {
    items.push({ name: 'Jonna Roti', quantity: 2, price: 25 });
  }

  return items;
}

// --- Generate 150 payments ---
function generateAllPayments(): Payment[] {
  const payments: Payment[] = [];

  // Today's payments (20)
  for (let i = 1; i <= 20; i++) {
    payments.push(
      createPayment(i, {
        transactionTime: now - randomInt(0, 12) * hour,
      })
    );
  }

  // Yesterday's payments (15)
  for (let i = 21; i <= 35; i++) {
    payments.push(
      createPayment(i, {
        transactionTime: now - day - randomInt(0, 23) * hour,
      })
    );
  }

  // Last 7 days (55 more)
  for (let i = 36; i <= 90; i++) {
    payments.push(
      createPayment(i, {
        transactionTime: now - randomInt(2, 7) * day - randomInt(0, 23) * hour,
      })
    );
  }

  // Last 30 days (60 more)
  for (let i = 91; i <= 150; i++) {
    payments.push(
      createPayment(i, {
        transactionTime: now - randomInt(8, 30) * day - randomInt(0, 23) * hour,
      })
    );
  }

  return payments.sort((a, b) => b.transactionTime - a.transactionTime);
}

export const mockPayments: Payment[] = generateAllPayments();

// --- COD Records ---
export const mockCodRecords: CodRecord[] = [
  {
    id: 'cod-001',
    orderId: 'RDK-1003',
    customerName: 'Vikram Singh',
    customerPhone: '+91 98765 11111',
    amount: 285,
    collectionStatus: 'collected',
    collectedBy: 'Rajesh (Delivery)',
    collectionTime: now - 2 * hour,
    remarks: 'Full amount collected',
    orderDate: now - 1 * day,
  },
  {
    id: 'cod-002',
    orderId: 'RDK-1007',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98765 22222',
    amount: 155,
    collectionStatus: 'collected',
    collectedBy: 'Suresh (Delivery)',
    collectionTime: now - 5 * hour,
    remarks: 'Paid with ₹200, change ₹45 returned',
    orderDate: now - 1 * day,
  },
  {
    id: 'cod-003',
    orderId: 'RDK-1012',
    customerName: 'Amit Patel',
    customerPhone: '+91 98765 33333',
    amount: 320,
    collectionStatus: 'pending',
    collectedBy: '',
    collectionTime: null,
    remarks: 'Customer not available, will retry tomorrow',
    orderDate: now - 0.5 * day,
  },
  {
    id: 'cod-004',
    orderId: 'RDK-1018',
    customerName: 'Sneha Reddy',
    customerPhone: '+91 98765 44444',
    amount: 190,
    collectionStatus: 'collected',
    collectedBy: 'Delivery Boy - Venkat',
    collectionTime: now - 8 * hour,
    remarks: 'Exact change received',
    orderDate: now - 1 * day,
  },
  {
    id: 'cod-005',
    orderId: 'RDK-1025',
    customerName: 'Sanjay Mishra',
    customerPhone: '+91 98765 55555',
    amount: 450,
    collectionStatus: 'failed_collection',
    collectedBy: 'Rajesh (Delivery)',
    collectionTime: null,
    remarks: 'Customer refused to pay, order returned',
    orderDate: now - 2 * day,
  },
  {
    id: 'cod-006',
    orderId: 'RDK-1031',
    customerName: 'Lakshmi Rao',
    customerPhone: '+91 98765 66666',
    amount: 175,
    collectionStatus: 'pending',
    collectedBy: '',
    collectionTime: null,
    remarks: 'Scheduled for evening delivery',
    orderDate: now - 0.25 * day,
  },
  {
    id: 'cod-007',
    orderId: 'RDK-1038',
    customerName: 'Ravi Teja',
    customerPhone: '+91 98765 77777',
    amount: 230,
    collectionStatus: 'collected',
    collectedBy: 'Rider - Prasad',
    collectionTime: now - 12 * hour,
    remarks: 'Payment received via UPI at doorstep',
    orderDate: now - 2 * day,
  },
  {
    id: 'cod-008',
    orderId: 'RDK-1045',
    customerName: 'Kavitha Devi',
    customerPhone: '+91 98765 88888',
    amount: 140,
    collectionStatus: 'collected',
    collectedBy: 'Suresh (Delivery)',
    collectionTime: now - 15 * hour,
    remarks: 'Full amount collected',
    orderDate: now - 3 * day,
  },
];

// --- Failed Payments ---
export const mockFailedPayments: FailedPayment[] = mockPayments
  .filter((p) => p.paymentStatus === 'failed')
  .slice(0, 15)
  .map((p) => ({
    id: `fp-${p.id}`,
    paymentId: p.paymentId,
    orderId: p.orderId,
    customerName: p.customerName,
    customerPhone: p.customerPhone,
    amount: p.amount,
    failureReason: randomItem(failureReasons),
    paymentMethod: p.paymentMethod,
    retryStatus: randomItem(['not_retried', 'not_retried', 'retried', 'retry_succeeded'] as const),
    transactionTime: p.transactionTime,
  }));

// --- Revenue trend data for charts ---
export function generateRevenueTrendData() {
  const data = [];
  for (let i = 13; i >= 0; i--) {
    const date = new Date(now - i * day);
    const dayPayments = mockPayments.filter((p) => {
      const pDate = new Date(p.transactionTime);
      return pDate.toDateString() === date.toDateString() && p.paymentStatus === 'paid';
    });
    const onlineRevenue = dayPayments
      .filter((p) => p.paymentMethod !== 'cod')
      .reduce((sum, p) => sum + p.amount, 0);
    const codRevenue = dayPayments
      .filter((p) => p.paymentMethod === 'cod')
      .reduce((sum, p) => sum + p.amount, 0);
    data.push({
      label: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      online: onlineRevenue,
      cod: codRevenue,
      total: onlineRevenue + codRevenue,
    });
  }
  return data;
}

export function generatePaymentMethodDistribution() {
  const dist: Record<string, number> = {};
  mockPayments.forEach((p) => {
    if (p.paymentStatus === 'paid' || p.paymentStatus === 'authorized') {
      dist[p.paymentMethod] = (dist[p.paymentMethod] || 0) + p.amount;
    }
  });
  return Object.entries(dist).map(([method, amount]) => ({
    method,
    label: method === 'upi' ? 'UPI' : method === 'credit_card' ? 'Credit Card' : method === 'debit_card' ? 'Debit Card' : method === 'net_banking' ? 'Net Banking' : method === 'wallet' ? 'Wallet' : 'COD',
    amount,
  }));
}
