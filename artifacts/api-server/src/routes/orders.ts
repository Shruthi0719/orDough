import { Router, type IRouter } from "express";
import { Customer, Order, isValidObjectId } from "@workspace/db";
import {
  CreateOrderBody,
  UpdateOrderBody,
  GetOrderParams,
  UpdateOrderParams,
  DeleteOrderParams,
  ListOrdersQueryParams,
  ListOrdersResponse,
  GetOrderResponse,
  UpdateOrderResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateInvoiceNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `ORD-${date}-${rand}`;
}

router.get("/orders", async (req, res): Promise<void> => {
  const query = ListOrdersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  let orders;
  if (query.data.status) {
    orders = await Order.find({ status: query.data.status }).sort({ createdAt: 1 });
  } else {
    orders = await Order.find().sort({ createdAt: 1 });
  }
  res.json(ListOrdersResponse.parse(orders.map(serializeOrder)));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const invoiceNumber = generateInvoiceNumber();
  const order = await Order.create({
    customerId: parsed.data.customerId ?? null,
    customerName: parsed.data.customerName,
    date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
    items: parsed.data.items as unknown[],
    discount: parsed.data.discount ?? 0,
    deliveryCharge: parsed.data.deliveryCharge ?? 0,
    status: parsed.data.status ?? "pending",
    notes: parsed.data.notes ?? null,
    invoiceNumber,
  });

  if (parsed.data.customerId) {
    const orderTotal = (parsed.data.items ?? []).reduce((sum, item) => sum + item.qty * item.price, 0)
      - (parsed.data.discount ?? 0)
      + (parsed.data.deliveryCharge ?? 0);
    if (isValidObjectId(parsed.data.customerId)) {
      await Customer.findByIdAndUpdate(parsed.data.customerId, {
        $inc: { totalOrders: 1, totalSpent: orderTotal },
      });
    }
  }

  res.status(201).json(GetOrderResponse.parse(serializeOrder(order)));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!isValidObjectId(params.data.id)) {
    res.status(400).json({ error: "Invalid order id" });
    return;
  }
  const order = await Order.findById(params.data.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(GetOrderResponse.parse(serializeOrder(order)));
});

router.patch("/orders/:id", async (req, res): Promise<void> => {
  const params = UpdateOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = {};
  if (parsed.data.customerName !== undefined) updateData.customerName = parsed.data.customerName;
  if (parsed.data.customerId !== undefined) updateData.customerId = parsed.data.customerId;
  if (parsed.data.date !== undefined) updateData.date = new Date(parsed.data.date);
  if (parsed.data.items !== undefined) updateData.items = parsed.data.items;
  if (parsed.data.discount !== undefined) updateData.discount = parsed.data.discount;
  if (parsed.data.deliveryCharge !== undefined) updateData.deliveryCharge = parsed.data.deliveryCharge;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;

  if (!isValidObjectId(params.data.id)) {
    res.status(400).json({ error: "Invalid order id" });
    return;
  }
  const order = await Order.findByIdAndUpdate(params.data.id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(UpdateOrderResponse.parse(serializeOrder(order)));
});

router.delete("/orders/:id", async (req, res): Promise<void> => {
  const params = DeleteOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!isValidObjectId(params.data.id)) {
    res.status(400).json({ error: "Invalid order id" });
    return;
  }
  const order = await Order.findByIdAndDelete(params.data.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.sendStatus(204);
});

function serializeOrder(order: { toJSON(): unknown }) {
  return order.toJSON();
}

export default router;
