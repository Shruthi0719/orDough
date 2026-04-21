import { useGetOrder } from "@workspace/api-client-react";
import { useParams } from "wouter";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function padInvoiceNumber(n: string | undefined) {
  if (!n) return "0001";
  const match = n.match(/\d+$/);
  return match ? String(Number(match[0])).padStart(4, "0") : n;
}

export default function Invoice() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useGetOrder(id ?? "");

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#D2E2EC", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#3A2119", fontFamily: "Cormorant Garamond, serif", fontSize: 22 }}>Loading invoice...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ minHeight: "100vh", background: "#D2E2EC", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "red" }}>Order not found</p>
      </div>
    );
  }

  const subtotal = order.items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discountPct = subtotal > 0 && order.discount > 0 ? Math.round((order.discount / subtotal) * 100) : 0;
  const grandTotal = subtotal - order.discount + order.deliveryCharge;

  return (
    <div style={{ minHeight: "100vh", background: "#D2E2EC", padding: "40px 16px", fontFamily: "sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:wght@700&display=swap');
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .invoice-card { box-shadow: none !important; }
        }
      `}</style>

      {/* Print button */}
      <div className="no-print" style={{ maxWidth: 720, margin: "0 auto 20px", textAlign: "right" }}>
        <button
          onClick={() => window.print()}
          style={{
            background: "#3A2119", color: "#D2E2EC", border: "none", borderRadius: 8,
            padding: "10px 28px", fontFamily: "Cormorant Garamond, serif", fontSize: 16,
            cursor: "pointer", letterSpacing: 1
          }}
        >
          🖨 Print / Save PDF
        </button>
      </div>

      {/* Invoice Card */}
      <div className="invoice-card" style={{
        maxWidth: 720, margin: "0 auto", background: "#D2E2EC",
        borderRadius: 16, boxShadow: "0 8px 40px rgba(58,33,25,0.13)", overflow: "hidden"
      }}>

        {/* TOP HEADER */}
        <div style={{ background: "#D2E2EC", padding: "36px 40px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          {/* Left: Cookie logo */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 4 }}>🍪</div>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 28, fontWeight: 700, color: "#3A2119", letterSpacing: 1 }}>
              orDough
            </div>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontSize: 15, color: "#79A3C3", marginTop: 2 }}>
              one more?
            </div>
          </div>

          {/* Right: INVOICE circle */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
            <div style={{
              border: "3px solid #3A2119", borderRadius: "50%", width: 110, height: 110,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <span style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: 20, color: "#3A2119", letterSpacing: 2 }}>
                INVOICE
              </span>
            </div>
          </div>
        </div>

        {/* Invoice meta */}
        <div style={{ padding: "0 40px 24px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #EBCDB7" }}>
          <div>
            <p style={{ color: "#957662", fontSize: 13, marginBottom: 4 }}>
              Invoice Number: <strong style={{ color: "#3A2119" }}>{padInvoiceNumber(order.invoiceNumber)}</strong>
            </p>
            <p style={{ color: "#957662", fontSize: 13 }}>
              Date: <strong style={{ color: "#3A2119" }}>{formatDate(order.date)}</strong>
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{
              background: "#EBCDB7", color: "#3A2119", borderRadius: 20,
              padding: "4px 14px", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1
            }}>
              {order.status}
            </span>
          </div>
        </div>

        {/* Billed To */}
        <div style={{ padding: "24px 40px", borderBottom: "1px solid #EBCDB7" }}>
          <p style={{ fontSize: 13, color: "#957662", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            Billed To:
          </p>
          <p style={{ fontWeight: 700, fontSize: 17, color: "#3A2119", marginBottom: 2 }}>
            Customer Name: {order.customerName}
          </p>
          {order.notes && (
            <p style={{ color: "#957662", fontSize: 14 }}>Address: {order.notes}</p>
          )}
        </div>

        {/* Items Table */}
        <div style={{ padding: "24px 40px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Description", "Price", "Quantity", "Amount"].map((h, i) => (
                  <th key={h} style={{
                    background: "#957662", color: "white",
                    padding: "12px 16px", textAlign: i === 0 ? "left" : "right",
                    fontSize: 13, fontWeight: 600, letterSpacing: 0.5,
                    borderRadius: i === 0 ? "20px 0 0 20px" : i === 3 ? "0 20px 20px 0" : undefined
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "rgba(235,205,183,0.18)" : "transparent" }}>
                  <td style={{ padding: "13px 16px", color: "#3A2119", fontSize: 15 }}>
                    {item.emoji} {item.name}
                  </td>
                  <td style={{ padding: "13px 16px", textAlign: "right", color: "#3A2119", fontSize: 15 }}>
                    ₹{Number(item.price).toFixed(0)}
                  </td>
                  <td style={{ padding: "13px 16px", textAlign: "right", color: "#3A2119", fontSize: 15 }}>
                    {item.qty}
                  </td>
                  <td style={{ padding: "13px 16px", textAlign: "right", color: "#3A2119", fontSize: 15, fontWeight: 600 }}>
                    ₹{(item.price * item.qty).toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ padding: "0 40px 32px", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ minWidth: 260 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#3A2119", fontSize: 15 }}>
              <span>Sub Total</span>
              <span style={{ fontWeight: 600 }}>₹{subtotal.toFixed(0)}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#2a7a3a", fontSize: 15 }}>
                <span>Discount ({discountPct}%)</span>
                <span style={{ fontWeight: 600 }}>₹{order.discount.toFixed(0)}</span>
              </div>
            )}
            {order.deliveryCharge > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#3A2119", fontSize: 15 }}>
                <span>Delivery</span>
                <span style={{ fontWeight: 600 }}>₹{order.deliveryCharge.toFixed(0)}</span>
              </div>
            )}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "#3A2119", borderRadius: 30, padding: "12px 22px", marginTop: 12
            }}>
              <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>Total</span>
              <span style={{
                color: "white", fontFamily: "Playfair Display, serif",
                fontWeight: 700, fontSize: 22
              }}>₹{grandTotal.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Payment Detail */}
        <div style={{ padding: "0 40px 36px" }}>
          <div style={{
            border: "2px solid #EBCDB7", borderRadius: 16, padding: "18px 24px",
            display: "inline-block", minWidth: 240
          }}>
            <p style={{ fontWeight: 700, color: "#3A2119", marginBottom: 8, fontSize: 15 }}>Payment Detail:</p>
            <p style={{ color: "#957662", fontSize: 14, marginBottom: 4 }}>Mode of Payment : UPI</p>
            <p style={{ color: "#957662", fontSize: 14 }}>Phone Number &nbsp;&nbsp;&nbsp;: 7997078952</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: "1px solid #EBCDB7", padding: "20px 40px",
          textAlign: "center", background: "#D2E2EC"
        }}>
          <p style={{
            fontFamily: "Cormorant Garamond, serif", fontStyle: "italic",
            fontSize: 18, color: "#3A2119"
          }}>
            Thank you for choosing orDough 🍪
          </p>
        </div>
      </div>
    </div>
  );
}
