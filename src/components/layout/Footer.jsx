import { useBilling } from "../../context";

function Footer() {
  const { settings } = useBilling();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div>
        © {currentYear} <strong>{settings.businessName || "ABC Traders"}</strong>. All rights reserved.
      </div>
      <div>
        GST Enabled Billing & Invoicing • React Application
      </div>
    </footer>
  );
}

export default Footer;
