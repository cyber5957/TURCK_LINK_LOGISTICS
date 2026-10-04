const nodemailer = require('nodemailer');

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from || !Number.isFinite(port)) return null;
  return { host, port, user, pass, from };
}

async function sendBookingConfirmationEmail({ recipient, customerName, booking, truck }) {
  const config = getSmtpConfig();
  if (!config) return { sent: false, reason: 'not_configured' };

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
  });

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(booking.price);

  try {
    await transporter.sendMail({
      from: config.from,
      to: recipient,
      subject: `TruckLink booking request ${booking.bookingReference}`,
      text: [
        `Hello ${customerName || 'Customer'},`,
        '',
        'We received your TruckLink booking request.',
        `Reference: ${booking.bookingReference}`,
        `Truck: ${truck.truckType} (${truck.truckNumber})`,
        `Pickup: ${booking.pickupLocation}`,
        `Delivery: ${booking.deliveryLocation}`,
        `Cargo: ${booking.cargoType}`,
        `Weight: ${booking.weight}`,
        `Pickup date: ${new Date(booking.pickupDate).toLocaleDateString('en-IN')}`,
        `Estimated fare: ${formattedPrice}`,
        `Status: ${booking.status}`,
        '',
        'This email confirms that your request was received. The transport partner will confirm availability separately.',
        'TruckLink Logistics',
      ].join('\n'),
    });
    return { sent: true };
  } catch (error) {
    console.error('Booking confirmation email failed:', error.message);
    return { sent: false, reason: 'send_failed' };
  }
}

module.exports = { sendBookingConfirmationEmail };
