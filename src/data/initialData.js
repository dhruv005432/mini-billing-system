export const initialProducts = [
  {
    id: 1,
    name: "T-Shirt",
    sku: "TS001",
    category: "Clothes",
    price: 500,
    purchasePrice: 350,
    gst: 5,
    stock: 25
  },
  {
    id: 2,
    name: "Shirt",
    sku: "SH002",
    category: "Clothes",
    price: 900,
    purchasePrice: 650,
    gst: 12,
    stock: 20
  },
  {
    id: 3,
    name: "Jeans",
    sku: "JN003",
    category: "Clothes",
    price: 1500,
    purchasePrice: 1000,
    gst: 18,
    stock: 15
  },
  {
    id: 4,
    name: "Shoes",
    sku: "SH004",
    category: "Footwear",
    price: 2000,
    purchasePrice: 1400,
    gst: 18,
    stock: 10
  },
  {
    id: 5,
    name: "Cotton Cap",
    sku: "CP005",
    category: "Accessories",
    price: 300,
    purchasePrice: 180,
    gst: 5,
    stock: 35
  },
  {
    id: 6,
    name: "Leather Belt",
    sku: "BL006",
    category: "Accessories",
    price: 800,
    purchasePrice: 500,
    gst: 18,
    stock: 18
  }
];

export const initialCustomers = [
  {
    id: 1,
    name: "Raj Patel",
    mobile: "9876543210",
    email: "raj@gmail.com",
    address: "Ring Road",
    city: "Surat",
    state: "Gujarat",
    pincode: "395002",
    gstNumber: "24AAACP1234A1Z5",
    customerType: "Retail"
  },
  {
    id: 2,
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
    id: 3,
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
];

export const initialUsers = [
  {
    id: 1,
    businessName: "ABC Traders",
    ownerName: "Admin",
    email: "admin@abctraders.com",
    password: "Abc@#!20006",
    mobile: "9876543210",
    address: "402, Ring Road, Surat, Gujarat - 395002",
    gstNumber: "24AAACB1234A1Z5"
  }
];

export const initialSettings = {
  businessName: "ABC Traders",
  ownerName: "Admin",
  mobile: "9876543210",
  email: "contact@abctraders.com",
  address: "402, Ring Road, Surat, Gujarat - 395002",
  gstNumber: "24AAACB1234A1Z5",
  invoicePrefix: "INV",
  startingNumber: 1001,
  currency: "₹",
  gstMode: "CGST + SGST",
  invoiceFooter: "Thank you for your business! Please visit again."
};

const today = new Date().toISOString().split("T")[0];

export const initialInvoices = [
  {
    id: 1,
    invoiceNumber: "INV-1001",
    date: today,
    customerId: 1,
    customerName: "Raj Patel",
    customerMobile: "9876543210",
    customerAddress: "Ring Road, Surat, Gujarat",
    customerGst: "24AAACP1234A1Z5",
    items: [
      {
        productId: 1,
        name: "T-Shirt",
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
        productId: 3,
        name: "Jeans",
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
        id: 1,
        amount: 2649.5,
        paymentMethod: "UPI",
        date: today
      }
    ],
    notes: "Prompt settlement via UPI"
  },
  {
    id: 2,
    invoiceNumber: "INV-1002",
    date: today,
    customerId: 2,
    customerName: "Amit Shah",
    customerMobile: "9988776655",
    customerAddress: "Varachha, Surat, Gujarat",
    customerGst: "24BBBCS5678B1Z2",
    items: [
      {
        productId: 2,
        name: "Shirt",
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
        id: 2,
        amount: 1000,
        paymentMethod: "Cash",
        date: today
      }
    ],
    notes: "₹1000 paid, ₹904 remaining"
  }
];
