import nodemailer from "nodemailer";
import NotificationLog from "../models/NotificationLog.js";

let transporter = null;
let isTestAccount = false;

const safeLog = async (data) => {
  try {
    await NotificationLog.create(data);
  } catch (err) {
    console.warn("NotificationLog warning (mail):", err.message);
  }
};

const initTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    console.log(`📧 Configured custom SMTP transporter for ${host}`);
  } else if (user && pass) {
    transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || "gmail",
      auth: { user, pass }
    });
    console.log(`📧 Configured ${process.env.SMTP_SERVICE || "Gmail"} transporter for ${user}`);
  } else {
    // Generate an automatic Ethereal test account for instant out-of-the-box email delivery
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      isTestAccount = true;
      console.log(`📧 Ethereal Test SMTP active (User: ${testAccount.user})`);
    } catch (err) {
      console.warn("⚠️ Nodemailer test account creation error, using fallback JSON transporter:", err.message);
      transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    }
  }

  return transporter;
};

export const sendOtpMail = async ({ to, otp, businessName = "ABC Traders", recipientName = "Valued Customer" }) => {
  try {
    const transport = await initTransporter();
    const fromAddress = process.env.SMTP_FROM || `"${businessName} Security" <noreply@abctraders.com>`;

    const mailOptions = {
      from: fromAddress,
      to,
      subject: `🔐 Your Security Verification OTP: ${otp} - ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: #2563eb; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700;">${businessName}</h1>
            <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Compulsory Two-Factor Security Verification</p>
          </div>
          <div style="padding: 30px 24px;">
            <p style="font-size: 16px; color: #1e293b; margin-top: 0;">Hello <strong>${recipientName}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.5;">
              You have requested access to the <strong>${businessName}</strong> Portal. Use the one-time passcode (OTP) below to authenticate your device:
            </p>
            <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 20px; text-align: center; margin: 25px 0;">
              <span style="font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #1e293b; display: inline-block;">${otp}</span>
              <p style="margin: 8px 0 0; color: #ef4444; font-size: 13px; font-weight: 600;">Valid for 5 minutes only. Do not share this code.</p>
            </div>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
              If you did not request this OTP, please immediately check your account security or contact support.
            </p>
          </div>
          <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
            This is an automated system notification from ${businessName}.
          </div>
        </div>
      `
    };

    const info = await transport.sendMail(mailOptions);
    const previewUrl = isTestAccount ? nodemailer.getTestMessageUrl(info) : null;

    console.log(`📩 OTP Email dispatched to ${to} (MessageId: ${info.messageId})`);
    if (previewUrl) console.log(`🔗 Email Preview URL: ${previewUrl}`);

    await safeLog({
      type: "mail",
      recipient: to,
      title: "OTP Verification Code",
      message: `OTP ${otp} sent to ${to}`,
      status: "delivered",
      meta: { otp, messageId: info.messageId, previewUrl }
    });

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error("❌ sendOtpMail Error:", error.message);
    await safeLog({
      type: "mail",
      recipient: to,
      title: "OTP Verification Code",
      message: `Failed sending OTP to ${to}: ${error.message}`,
      status: "failed"
    });
    return { success: false, error: error.message };
  }
};

export const sendInvoiceMail = async ({ to, invoice, businessName = "ABC Traders", currency = "₹" }) => {
  try {
    const transport = await initTransporter();
    const fromAddress = process.env.SMTP_FROM || `"${businessName} Invoicing" <billing@abctraders.com>`;

    const itemsRows = (invoice.items || [])
      .map(
        (it, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-size: 13px;">${idx + 1}</td>
          <td style="padding: 10px; font-size: 13px;"><strong>${it.name || "Item"}</strong></td>
          <td style="padding: 10px; font-size: 13px; text-align: center;">${it.quantity}</td>
          <td style="padding: 10px; font-size: 13px; text-align: right;">${currency}${Number(it.price || 0).toFixed(2)}</td>
          <td style="padding: 10px; font-size: 13px; text-align: right;">${currency}${Number(it.total || it.subtotal || 0).toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    const mailOptions = {
      from: fromAddress,
      to,
      subject: `🧾 Tax Invoice #${invoice.invoiceNumber} - ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: #1e293b; padding: 24px; color: #ffffff; display: flex; justify-content: space-between;">
            <div>
              <h2 style="margin: 0; font-size: 22px;">${businessName}</h2>
              <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">Tax Invoice Receipt</p>
            </div>
            <div style="text-align: right;">
              <h3 style="margin: 0; color: #38bdf8;">${invoice.invoiceNumber}</h3>
              <p style="margin: 4px 0 0; font-size: 12px;">Date: ${invoice.date}</p>
            </div>
          </div>
          <div style="padding: 24px;">
            <p style="font-size: 15px; color: #334155; margin-top: 0;">
              Dear <strong>${invoice.customerName}</strong>, thank you for your business! Below are your invoice details:
            </p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                  <th style="padding: 10px; font-size: 12px; text-align: left;">#</th>
                  <th style="padding: 10px; font-size: 12px; text-align: left;">Product</th>
                  <th style="padding: 10px; font-size: 12px; text-align: center;">Qty</th>
                  <th style="padding: 10px; font-size: 12px; text-align: right;">Rate</th>
                  <th style="padding: 10px; font-size: 12px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-top: 15px;">
              <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px;">
                <span>Taxable Amount:</span>
                <strong>${currency}${Number(invoice.taxableAmount || 0).toFixed(2)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px;">
                <span>GST (CGST + SGST):</span>
                <strong>${currency}${Number(invoice.gstTotal || invoice.gstAmount || 0).toFixed(2)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 18px; border-top: 2px solid #e2e8f0; margin-top: 8px;">
                <span>Grand Total:</span>
                <strong style="color: #2563eb;">${currency}${Number(invoice.total || 0).toFixed(2)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; color: #16a34a;">
                <span>Payment Status:</span>
                <strong>${invoice.paymentStatus || "Paid"} (${invoice.paymentMethod || "Cash"})</strong>
              </div>
            </div>
          </div>
          <div style="background: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 12px; color: #64748b;">
            Thank you for shopping with ${businessName}. Have a wonderful day!
          </div>
        </div>
      `
    };

    const info = await transport.sendMail(mailOptions);
    const previewUrl = isTestAccount ? nodemailer.getTestMessageUrl(info) : null;

    await safeLog({
      type: "mail",
      recipient: to,
      title: `Invoice ${invoice.invoiceNumber}`,
      message: `Tax invoice sent to ${to}`,
      status: "delivered",
      meta: { invoiceNumber: invoice.invoiceNumber, total: invoice.total, previewUrl }
    });

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error("❌ sendInvoiceMail Error:", error.message);
    return { success: false, error: error.message };
  }
};

export const sendPaymentMail = async ({ to, invoice, paymentAmount, paymentMethod, businessName = "ABC Traders", currency = "₹" }) => {
  try {
    const transport = await initTransporter();
    const fromAddress = process.env.SMTP_FROM || `"${businessName} Accounts" <billing@abctraders.com>`;

    const mailOptions = {
      from: fromAddress,
      to,
      subject: `💰 Payment Received: ${currency}${paymentAmount} for Invoice #${invoice.invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: #16a34a; padding: 24px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 22px;">Payment Receipt Acknowledgment</h2>
            <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">${businessName}</p>
          </div>
          <div style="padding: 24px;">
            <p style="font-size: 15px; color: #334155; margin-top: 0;">Dear <strong>${invoice.customerName}</strong>,</p>
            <p style="font-size: 14px; color: #475569;">We have successfully received and recorded your payment for invoice <strong>#${invoice.invoiceNumber}</strong>:</p>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px; margin: 20px 0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #166534;">Payment Amount:</span>
                <strong style="font-size: 18px; color: #166534;">${currency}${Number(paymentAmount).toFixed(2)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #4b5563;">Payment Method:</span>
                <strong>${paymentMethod}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #4b5563;">Total Paid Till Date:</span>
                <strong>${currency}${Number(invoice.amountPaid || 0).toFixed(2)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; border-top: 1px solid #bbf7d0; padding-top: 8px;">
                <span style="color: #b91c1c; font-weight: 600;">Remaining Balance Due:</span>
                <strong style="color: #b91c1c;">${currency}${Number(invoice.amountDue || 0).toFixed(2)}</strong>
              </div>
            </div>
          </div>
          <div style="background: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 12px; color: #64748b;">
            Thank you for prompt settlement with ${businessName}.
          </div>
        </div>
      `
    };

    const info = await transport.sendMail(mailOptions);
    const previewUrl = isTestAccount ? nodemailer.getTestMessageUrl(info) : null;

    await safeLog({
      type: "mail",
      recipient: to,
      title: "Payment Receipt",
      message: `Received ${currency}${paymentAmount} for invoice #${invoice.invoiceNumber}`,
      status: "delivered",
      meta: { invoiceNumber: invoice.invoiceNumber, paymentAmount, previewUrl }
    });

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error("❌ sendPaymentMail Error:", error.message);
    return { success: false, error: error.message };
  }
};
