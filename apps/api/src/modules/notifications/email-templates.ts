export function supplierRegisteredEmail(data: {
  businessName: string;
  contactName: string;
  email: string;
  warehouseCity: string;
  adminUrl: string;
}) {
  const subject = `New Supplier Registration: ${data.businessName}`;
  const text = [
    `A new supplier has registered on DropMart.`,
    ``,
    `Business: ${data.businessName}`,
    `Contact: ${data.contactName}`,
    `Email: ${data.email}`,
    `City: ${data.warehouseCity}`,
    ``,
    `Review and verify: ${data.adminUrl}`,
  ].join("\n");

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#10b981;margin:0 0 16px">New Supplier Registration</h2>
      <p>A new supplier is waiting for verification on DropMart.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 0;color:#666">Business</td><td style="padding:8px 0;font-weight:600">${data.businessName}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Contact</td><td style="padding:8px 0">${data.contactName}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0">${data.email}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Warehouse City</td><td style="padding:8px 0">${data.warehouseCity}</td></tr>
      </table>
      <a href="${data.adminUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
        Review Supplier
      </a>
    </div>
  `;

  return { subject, text, html };
}

export function productSubmittedEmail(data: {
  productName: string;
  supplierName: string;
  price: number;
  category: string;
  adminUrl: string;
}) {
  const subject = `New Product Pending Approval: ${data.productName}`;
  const text = [
    `A supplier submitted a new product for approval.`,
    ``,
    `Product: ${data.productName}`,
    `Supplier: ${data.supplierName}`,
    `Category: ${data.category}`,
    `Price: ₹${data.price}`,
    ``,
    `Review: ${data.adminUrl}`,
  ].join("\n");

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#3b82f6;margin:0 0 16px">New Product Submitted</h2>
      <p>A supplier added a product that needs your approval.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 0;color:#666">Product</td><td style="padding:8px 0;font-weight:600">${data.productName}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Supplier</td><td style="padding:8px 0">${data.supplierName}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Category</td><td style="padding:8px 0">${data.category}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Price</td><td style="padding:8px 0">₹${data.price}</td></tr>
      </table>
      <a href="${data.adminUrl}" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
        Review Product
      </a>
    </div>
  `;

  return { subject, text, html };
}

export function productApprovedEmail(data: {
  productName: string;
  supplierName: string;
  price: number;
  storefrontUrl: string;
}) {
  const subject = `Product Approved: ${data.productName}`;
  const text = [
    `Great news! Your product has been approved and is now live on DropMart.`,
    ``,
    `Product: ${data.productName}`,
    `Price: ₹${data.price}`,
    ``,
    `View on storefront: ${data.storefrontUrl}`,
  ].join("\n");

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#10b981;margin:0 0 16px">Product Approved ✓</h2>
      <p>Hi ${data.supplierName}, your product <strong>${data.productName}</strong> has been approved and is now visible to customers.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 0;color:#666">Product</td><td style="padding:8px 0;font-weight:600">${data.productName}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Price</td><td style="padding:8px 0">₹${data.price}</td></tr>
      </table>
      <a href="${data.storefrontUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
        View on Storefront
      </a>
    </div>
  `;

  return { subject, text, html };
}

export function productRejectedEmail(data: {
  productName: string;
  supplierName: string;
  note?: string;
  supplierUrl: string;
}) {
  const subject = `Product Not Approved: ${data.productName}`;
  const text = [
    `Your product submission was not approved.`,
    ``,
    `Product: ${data.productName}`,
    data.note ? `Reason: ${data.note}` : "",
    ``,
    `Review and resubmit: ${data.supplierUrl}`,
  ].filter(Boolean).join("\n");

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#ef4444;margin:0 0 16px">Product Not Approved</h2>
      <p>Hi ${data.supplierName}, your product <strong>${data.productName}</strong> was not approved.</p>
      ${data.note ? `<p style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:4px"><strong>Reason:</strong> ${data.note}</p>` : ""}
      <p>You can update the product details and submit again.</p>
      <a href="${data.supplierUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
        Go to My Products
      </a>
    </div>
  `;

  return { subject, text, html };
}

export function orderConfirmedEmail(data: {
  customerName: string;
  orderNumber: string;
  total: number;
  trackUrl: string;
}) {
  const subject = `Order Confirmed — ${data.orderNumber}`;
  const text = [
    `Hi ${data.customerName}, your payment was successful!`,
    ``,
    `Order: ${data.orderNumber}`,
    `Total: ₹${data.total}`,
    ``,
    `Track your order: ${data.trackUrl}`,
  ].join("\n");

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#10b981;margin:0 0 16px">Order Confirmed ✓</h2>
      <p>Hi ${data.customerName}, we've received your payment and started processing your order.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 0;color:#666">Order</td><td style="padding:8px 0;font-weight:600">${data.orderNumber}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Total</td><td style="padding:8px 0">₹${data.total}</td></tr>
      </table>
      <a href="${data.trackUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
        View My Orders
      </a>
    </div>
  `;

  return { subject, text, html };
}

export function newOrderAdminEmail(data: {
  orderNumber: string;
  customerName: string;
  total: number;
  paymentMethod: string;
  adminUrl: string;
}) {
  const subject = `New Order: ${data.orderNumber}`;
  const text = [
    `A new order has been placed on DropMart.`,
    ``,
    `Order: ${data.orderNumber}`,
    `Customer: ${data.customerName}`,
    `Total: ₹${data.total}`,
    `Payment: ${data.paymentMethod}`,
    ``,
    `View in admin: ${data.adminUrl}`,
  ].join("\n");

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#10b981;margin:0 0 16px">New Order Received</h2>
      <p>Order <strong>${data.orderNumber}</strong> is confirmed and ready for fulfillment.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 0;color:#666">Customer</td><td style="padding:8px 0">${data.customerName}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Total</td><td style="padding:8px 0;font-weight:600">₹${data.total}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Payment</td><td style="padding:8px 0">${data.paymentMethod}</td></tr>
      </table>
      <a href="${data.adminUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
        View Order
      </a>
    </div>
  `;

  return { subject, text, html };
}

export function liveTrackingEmail(data: {
  customerName: string;
  orderNumber: string;
  riderName: string;
  statusLabel: string;
  trackUrl: string;
  message: string;
}) {
  const subject = `${data.statusLabel} — Order ${data.orderNumber}`;
  const text = [
    `Hi ${data.customerName},`,
    ``,
    data.message,
    ``,
    `Delivery partner: ${data.riderName}`,
    `Track live: ${data.trackUrl}`,
  ].join("\n");

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff">
      <h2 style="color:#10b981;margin:0 0 16px">Live Delivery Update</h2>
      <p style="color:#1f2937;line-height:1.6">${data.message}</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 0;color:#666">Order</td><td style="padding:8px 0;font-weight:600;color:#111">${data.orderNumber}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Rider</td><td style="padding:8px 0;color:#111">${data.riderName}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Status</td><td style="padding:8px 0;color:#111">${data.statusLabel}</td></tr>
      </table>
      <a href="${data.trackUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
        Track on Live Map
      </a>
    </div>
  `;

  return { subject, text, html };
}

export function registrationOtpEmail(data: { otp: string; expiresMinutes: number }) {
  const subject = `${data.otp} is your DropMart verification code`;
  const text = [
    `Your DropMart email verification code is: ${data.otp}`,
    ``,
    `This code expires in ${data.expiresMinutes} minutes.`,
    `If you did not request this, you can ignore this email.`,
  ].join("\n");

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#10b981;margin:0 0 16px">Verify your email</h2>
      <p>Use this code to complete your DropMart registration:</p>
      <div style="margin:24px 0;padding:20px;background:#f0fdf4;border-radius:12px;text-align:center">
        <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#10b981">${data.otp}</span>
      </div>
      <p style="color:#666;font-size:14px">Expires in <strong>${data.expiresMinutes} minutes</strong>. Do not share this code.</p>
    </div>
  `;

  return { subject, text, html };
}
