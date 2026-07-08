import type {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  OrderType,
  PaymentInfo,
  Customer,
  OrderItem,
  DeliveryInfo,
  OrderTimelineEntry,
} from "../types/order"

const now = new Date()
const day = 24 * 60 * 60 * 1000
const hour = 60 * 60 * 1000

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateRazorpayId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  return "pay_" + Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * 36)]).join("")
}

function generateRefNumber(): string {
  return "TXN" + Date.now().toString(36).toUpperCase() + randomInt(1000, 9999)
}

const customerNames = [
  "Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Reddy", "Vikram Singh",
  "Anjali Nair", "Suresh Babu", "Meera Iyer", "Ravi Teja", "Kavitha Devi",
  "Mohammed Ali", "Pooja Gupta", "Arun Prasad", "Divya Menon", "Sanjay Mishra",
  "Lakshmi Rao", "Kiran Kumar", "Nisha Verma", "Ramesh Chandra", "Swathi Reddy",
  "Deepak Joshi", "Padma Lakshmi", "Ganesh Babu", "Sravani Priya", "Naveen Kumar",
  "Harika Devi", "Bharath Reddy", "Chandini Chowdary", "Venu Gopal", "Ramya Sri",
]

const phoneNumbers = [
  "+91 98765 43210", "+91 98765 11111", "+91 98765 22222", "+91 98765 33333",
  "+91 98765 44444", "+91 98765 55555", "+91 98765 66666", "+91 98765 77777",
  "+91 98765 88888", "+91 98765 99999", "+91 91234 56789", "+91 92345 67890",
  "+91 93456 78901", "+91 94567 89012", "+91 95678 90123", "+91 96789 01234",
  "+91 97890 12345", "+91 98901 23456", "+91 99012 34567", "+91 80123 45678",
  "+91 81234 56789", "+91 82345 67890", "+91 83456 78901", "+91 84567 89012",
  "+91 85678 90123", "+91 86789 01234", "+91 87890 12345", "+91 88901 23456",
  "+91 89012 34567", "+91 70123 45678",
]

const addresses = [
  "42 Jubilee Hills Road No 36, Near Tabla Restaurant, Hyderabad",
  "15th Floor DLF Cyber City, Phase 2, HITEC City, Hyderabad",
  "8-3-123 Ameerpet, Near Metro Station, Hyderabad",
  "Road No 10 Banjara Hills, Near Chutneys, Hyderabad",
  "5-9-123 Gachibowli, Financial District, Hyderabad",
  "1-2-345 Kukatpally, Near JNTU, Hyderabad",
  "7-8-90 Miyapur, X Roads, Hyderabad",
  "3-4-567 Kompally, NH 44, Hyderabad",
  "2-1-89 Nacharam, IDA, Hyderabad",
  "6-7-89 Uppal, Laxmi Ganesh Nagar, Hyderabad",
  "10-5-23 Malakpet, Near Market, Hyderabad",
  "9-2-45 Secunderabad, MG Road, Hyderabad",
]

const foodItems = [
  { name: "Jonna Roti", price: 25 },
  { name: "Chapathi", price: 20 },
  { name: "Ragi Roti", price: 30 },
  { name: "Bajra Roti", price: 28 },
  { name: "Dal Tadka", price: 60 },
  { name: "Paneer Curry", price: 80 },
  { name: "Chicken Curry", price: 120 },
  { name: "Egg Curry", price: 70 },
  { name: "Mix Veg", price: 65 },
  { name: "Sambar Rice", price: 55 },
  { name: "Curd Rice", price: 50 },
  { name: "Veg Biryani", price: 90 },
  { name: "Chicken Biryani", price: 140 },
  { name: "Gongura Chicken", price: 150 },
  { name: "Mutton Curry", price: 180 },
  { name: "Fish Fry", price: 160 },
  { name: "Papad", price: 15 },
  { name: "Buttermilk", price: 20 },
  { name: "Sweet (Payasam)", price: 40 },
  { name: "Rice", price: 30 },
]

const deliverySlots = [
  "6:00 AM - 8:00 AM",
  "12:00 PM - 2:00 PM",
  "7:00 PM - 9:00 PM",
]

const upiApps = ["Google Pay", "PhonePe", "Paytm", "BHIM"]
const cardNetworks = ["Visa", "Mastercard", "RuPay"]
const banks = ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Bank"]

function generateItems(count: number): OrderItem[] {
  const items: OrderItem[] = []
  const used = new Set<string>()
  for (let i = 0; i < count; i++) {
    let item = randomItem(foodItems)
    while (used.has(item.name)) item = randomItem(foodItems)
    used.add(item.name)
    const qty = randomInt(1, 3)
    items.push({
      id: `item-${Date.now()}-${i}`,
      foodName: item.name,
      quantity: qty,
      unitPrice: item.price,
      total: item.price * qty,
    })
  }
  return items
}

function generatePaymentInfo(
  method: PaymentMethod,
  status: PaymentStatus,
  subtotal: number,
  timestamp: string,
): PaymentInfo {
  const deliveryCharges = 20
  const discount = Math.round(subtotal * (randomInt(0, 8) / 100))
  const taxes = Math.round(subtotal * 0.05)
  const grandTotal = subtotal + deliveryCharges - discount + taxes

  const isOnline = method === "online"
  const isCod = method === "cod"

  const payment: PaymentInfo = {
    method,
    status,
    subtotal,
    taxes,
    deliveryCharges,
    discount,
    grandTotal,
  }

  if (isOnline && status !== "failed") {
    payment.transactionId = generateRazorpayId()
    payment.gateway = "razorpay"
    payment.referenceNumber = generateRefNumber()
    payment.paymentDateTime = timestamp
    payment.paymentTimeline = {
      initiated: new Date(new Date(timestamp).getTime() - 2 * 60000).toISOString(),
      authorized: new Date(new Date(timestamp).getTime() - 1 * 60000).toISOString(),
      successful: status === "paid" ? timestamp : undefined,
    }
  } else if (isCod) {
    payment.cod = {
      collectionStatus: status === "cod_collected" ? "collected" : status === "failed" ? "failed_collection" : "pending",
      collectionTime: status === "cod_collected" ? new Date(new Date(timestamp).getTime() + 30 * 60000).toISOString() : undefined,
      collectedBy: status === "cod_collected" ? randomItem(["Rajesh (Delivery)", "Suresh (Delivery)", "Venkat (Rider)"]) : undefined,
    }
    payment.paymentTimeline = {
      initiated: timestamp,
    }
  } else if (status === "failed") {
    payment.transactionId = generateRazorpayId()
    payment.gateway = "razorpay"
    payment.referenceNumber = generateRefNumber()
    payment.paymentDateTime = timestamp
    payment.paymentTimeline = {
      initiated: new Date(new Date(timestamp).getTime() - 2 * 60000).toISOString(),
      failed: timestamp,
    }
  }

  return payment
}

function generateTimeline(status: OrderStatus, createdAt: string): OrderTimelineEntry[] {
  const ts = new Date(createdAt).getTime()
  const entries: OrderTimelineEntry[] = [
    { status: "pending", timestamp: createdAt, label: "Order Placed" },
  ]

  const statusOrder: OrderStatus[] = ["accepted", "preparing", "packed", "out_for_delivery", "delivered"]
  const currentIdx = statusOrder.indexOf(status)

  if (status === "cancelled") {
    entries.push({ status: "cancelled", timestamp: new Date(ts + randomInt(5, 30) * 60000).toISOString(), label: "Cancelled" })
  } else {
    for (let i = 0; i <= currentIdx; i++) {
      entries.push({
        status: statusOrder[i],
        timestamp: new Date(ts + (i + 1) * randomInt(10, 60) * 60000).toISOString(),
        label: statusOrder[i].replace(/_/g, " "),
      })
    }
  }

  return entries
}

function createOrder(index: number, overrides?: Partial<Order>): Order {
  const status = overrides?.status || randomItem(["pending", "accepted", "preparing", "packed", "out_for_delivery", "delivered", "cancelled"] as OrderStatus[])
  const method = overrides?.payment?.method || (Math.random() < 0.55 ? "online" : "cod")
  const items = overrides?.items || generateItems(randomInt(2, 5))
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const createdAt = overrides?.createdAt || new Date(now.getTime() - randomInt(0, 14) * day - randomInt(0, 23) * hour).toISOString()

  let paymentStatus: PaymentStatus
  if (method === "cod") {
    paymentStatus = status === "delivered" ? "cod_collected" : status === "cancelled" ? "failed" : "cod_pending"
  } else {
    paymentStatus = status === "cancelled" ? "failed" : randomItem(["paid", "paid", "paid", "pending", "failed"] as PaymentStatus[])
  }

  const payment = overrides?.payment || generatePaymentInfo(method, paymentStatus, subtotal, createdAt)

  const customerIdx = index % customerNames.length
  const customer: Customer = overrides?.customer || {
    id: `cust-${String(customerIdx + 1).padStart(3, "0")}`,
    name: customerNames[customerIdx],
    phone: phoneNumbers[customerIdx],
    totalOrders: randomInt(1, 25),
    subscription: Math.random() < 0.2 ? randomItem(["Starter", "Family", "Premium"]) : undefined,
  }

  const delivery: DeliveryInfo = overrides?.delivery || {
    address: randomItem(addresses),
    pincode: `5000${randomInt(10, 99)}`,
    slot: randomItem(deliverySlots),
    date: new Date(new Date(createdAt).getTime() + day).toISOString().split("T")[0],
    instructions: Math.random() < 0.3 ? randomItem(["Ring the bell", "Leave at door", "Call before delivery", "Extra napkins please"]) : undefined,
  }

  const orderNumber = `RDK-${1000 + index}`
  const timeline = overrides?.timeline || generateTimeline(status, createdAt)

  return {
    id: `ord-${String(index).padStart(4, "0")}`,
    orderNumber,
    customer,
    items,
    delivery,
    payment,
    status,
    orderType: overrides?.orderType || "one_time",
    timeline,
    createdAt,
    updatedAt: createdAt,
    ...overrides,
  }
}

export const mockOrders: Order[] = Array.from({ length: 50 }, (_, i) => createOrder(i + 1))

export const mockStatistics = {
  todayOrders: mockOrders.filter((o) => {
    const d = new Date(o.createdAt)
    const today = new Date()
    return d.toDateString() === today.toDateString()
  }).length || randomInt(8, 18),
  preparing: mockOrders.filter((o) => o.status === "preparing").length,
  packed: mockOrders.filter((o) => o.status === "packed").length,
  outForDelivery: mockOrders.filter((o) => o.status === "out_for_delivery").length,
  delivered: mockOrders.filter((o) => o.status === "delivered").length,
  cancelled: mockOrders.filter((o) => o.status === "cancelled").length,
  totalRevenueToday: mockOrders
    .filter((o) => o.payment.status === "paid" || o.payment.status === "cod_collected")
    .reduce((sum, o) => sum + o.payment.grandTotal, 0),
}
