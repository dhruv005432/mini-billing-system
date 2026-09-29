import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import Invoice from "../models/Invoice.js";
import Settings from "../models/Settings.js";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mini_billing_system";
  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    await autoSeedDatabase();
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
  }
};

const autoSeedDatabase = async () => {
  try {
    // 1. Seed User
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({
        businessName: "ABC Traders",
        ownerName: "Admin",
        email: "admin@abctraders.com",
        password: "Abc@#!20006",
        mobile: "9876543210",
        address: "402, Ring Road, Surat, Gujarat - 395002",
        gstNumber: "24AAACB1234A1Z5"
      });
      console.log("🌱 Default User seeded.");
    }

    // 2. Seed Settings
    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      await Settings.create({
        businessName: "ABC Traders",
        ownerName: "Admin",
        mobile: "9876543210",
        email: "contact@abctraders.com",
        address: "402, Ring Road, Surat, Gujarat - 395002",
        gstNumber: "24AAACB1234A1Z5",
        invoicePrefix: "INV",
        startingNumber: 1001,
        currency: "₹"
      });
      console.log("🌱 Default Settings seeded.");
    }

    // 3. Seed Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany([
        {
          name: "Cotton T-Shirt",
          sku: "TSH-COT-001",
          category: "Clothing",
          price: 500,
          purchasePrice: 320,
          gst: 5,
          stock: 45,
          unit: "Pcs",
          minStock: 10
        },
        {
          name: "Casual Formal Shirt",
          sku: "SHT-FRM-002",
          category: "Clothing",
          price: 900,
          purchasePrice: 600,
          gst: 12,
          stock: 30,
          unit: "Pcs",
          minStock: 8
        },
        {
          name: "Denim Jeans",
          sku: "JNS-DNM-003",
          category: "Clothing",
          price: 1500,
          purchasePrice: 950,
          gst: 18,
          stock: 22,
          unit: "Pcs",
          minStock: 5
        },
        {
          name: "Wireless Optical Mouse",
          sku: "ELE-MOU-004",
          category: "Electronics",
          price: 450,
          purchasePrice: 280,
          gst: 18,
          stock: 40,
          unit: "Pcs",
          minStock: 10
        },
        {
          name: "Mechanical Keyboard RGB",
          sku: "ELE-KBD-005",
          category: "Electronics",
          price: 2200,
          purchasePrice: 1500,
          gst: 18,
          stock: 15,
          unit: "Pcs",
          minStock: 4
        }
      ]);
      console.log("🌱 Default Products seeded.");
    }

    // 4. Seed Customers
    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      await Customer.insertMany([
        {
          name: "Raj Patel",
          mobile: "9876543210",
          email: "raj.patel@example.com",
          address: "Ring Road",
          city: "Surat",
          state: "Gujarat",
          pincode: "395002",
          gstNumber: "24AAACP1234A1Z5",
          customerType: "Retail"
        },
        {
          name: "Amit Shah",
          mobile: "9988776655",
          email: "amit@gmail.com",
          address: "Varachha Main Road",
          city: "Surat",
          state: "Gujarat",
          pincode: "395006",
          gstNumber: "24BBBCS5678B1Z2",
          customerType: "Wholesale"
        },
        {
          name: "Ravi Kumar",
          mobile: "9811223344",
          email: "ravi.kumar@example.com",
          address: "Navrangpura",
          city: "Ahmedabad",
          state: "Gujarat",
          pincode: "380009",
          gstNumber: "",
          customerType: "Individual"
        }
      ]);
      console.log("🌱 Default Customers seeded.");
    }

    // 5. Seed Invoices
    const invoiceCount = await Invoice.countDocuments();
    if (invoiceCount === 0) {
      const today = new Date().toISOString().split("T")[0];
      await Invoice.insertMany([
        {
          invoiceNumber: "INV-1001",
          date: today,
          customerName: "Raj Patel",
          customerMobile: "9876543210",
          customerAddress: "Ring Road, Surat, Gujarat",
          customerGst: "24AAACP1234A1Z5",
          items: [
            {
              name: "Cotton T-Shirt",
              sku: "TSH-COT-001",
              price: 500,
              quantity: 2,
              discount: 50,
              gst: 5,
              subtotal: 1000,
              taxable: 950,
              gstAmount: 47.5,
              total: 997.5
            },
            {
              name: "Denim Jeans",
              sku: "JNS-DNM-003",
              price: 1500,
              quantity: 1,
              discount: 100,
              gst: 18,
              subtotal: 1500,
              taxable: 1400,
              gstAmount: 252,
              total: 1652
            }
          ],
          subtotal: 2500,
          discount: 150,
          taxableAmount: 2350,
          cgst: 149.75,
          sgst: 149.75,
          gstTotal: 299.5,
          gstAmount: 299.5,
          total: 2649.5,
          amountPaid: 2649.5,
          amountDue: 0,
          paymentStatus: "Paid",
          paymentMethod: "UPI",
          paymentHistory: [
            {
              id: "1",
              amount: 2649.5,
              paymentMethod: "UPI",
              date: today
            }
          ],
          notes: "Prompt settlement via UPI"
        },
        {
          invoiceNumber: "INV-1002",
          date: today,
          customerName: "Amit Shah",
          customerMobile: "9988776655",
          customerAddress: "Varachha, Surat, Gujarat",
          customerGst: "24BBBCS5678B1Z2",
          items: [
            {
              name: "Casual Formal Shirt",
              sku: "SHT-FRM-002",
              price: 900,
              quantity: 2,
              discount: 100,
              gst: 12,
              subtotal: 1800,
              taxable: 1700,
              gstAmount: 204,
              total: 1904
            }
          ],
          subtotal: 1800,
          discount: 100,
          taxableAmount: 1700,
          cgst: 102,
          sgst: 102,
          gstTotal: 204,
          gstAmount: 204,
          total: 1904,
          amountPaid: 1000,
          amountDue: 904,
          paymentStatus: "Partial",
          paymentMethod: "Cash",
          paymentHistory: [
            {
              id: "2",
              amount: 1000,
              paymentMethod: "Cash",
              date: today
            }
          ],
          notes: "₹1000 paid, ₹904 remaining"
        }
      ]);
      console.log("🌱 Default Invoices seeded.");
    }
  } catch (err) {
    console.warn("⚠️ Auto-seeding note:", err.message);
  }
};
