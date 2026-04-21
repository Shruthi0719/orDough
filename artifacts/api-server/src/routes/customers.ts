import { Router, type IRouter } from "express";
import { Customer, Order, isValidObjectId } from "@workspace/db";
import {
  CreateCustomerBody,
  UpdateCustomerBody,
  GetCustomerParams,
  UpdateCustomerParams,
  DeleteCustomerParams,
  ListCustomersQueryParams,
  ListCustomersResponse,
  GetCustomerResponse,
  UpdateCustomerResponse,
  GetCustomerOrdersParams,
  GetCustomerOrdersResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/customers", async (req, res): Promise<void> => {
  const query = ListCustomersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  let customers;
  if (query.data.search) {
    const search = new RegExp(escapeRegex(query.data.search), "i");
    customers = await Customer.find({
      $or: [{ name: search }, { phone: search }],
    }).sort({ createdAt: 1 });
  } else {
    customers = await Customer.find().sort({ createdAt: 1 });
  }
  res.json(ListCustomersResponse.parse(customers.map(serializeCustomer)));
});

router.post("/customers", async (req, res): Promise<void> => {
  const parsed = CreateCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const customer = await Customer.create({
    name: parsed.data.name,
    phone: parsed.data.phone ?? null,
    email: parsed.data.email ?? null,
    address: parsed.data.address ?? null,
    notes: parsed.data.notes ?? null,
  });
  res.status(201).json(GetCustomerResponse.parse(serializeCustomer(customer)));
});

router.get("/customers/:id", async (req, res): Promise<void> => {
  const params = GetCustomerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!isValidObjectId(params.data.id)) {
    res.status(400).json({ error: "Invalid customer id" });
    return;
  }
  const customer = await Customer.findById(params.data.id);
  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  res.json(GetCustomerResponse.parse(serializeCustomer(customer)));
});

router.patch("/customers/:id", async (req, res): Promise<void> => {
  const params = UpdateCustomerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!isValidObjectId(params.data.id)) {
    res.status(400).json({ error: "Invalid customer id" });
    return;
  }
  const customer = await Customer.findByIdAndUpdate(params.data.id, parsed.data, {
    new: true,
    runValidators: true,
  });
  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  res.json(UpdateCustomerResponse.parse(serializeCustomer(customer)));
});

router.delete("/customers/:id", async (req, res): Promise<void> => {
  const params = DeleteCustomerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!isValidObjectId(params.data.id)) {
    res.status(400).json({ error: "Invalid customer id" });
    return;
  }
  const customer = await Customer.findByIdAndDelete(params.data.id);
  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/customers/:id/orders", async (req, res): Promise<void> => {
  const params = GetCustomerOrdersParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!isValidObjectId(params.data.id)) {
    res.status(400).json({ error: "Invalid customer id" });
    return;
  }
  const orders = await Order.find({ customerId: params.data.id }).sort({ createdAt: 1 });
  res.json(GetCustomerOrdersResponse.parse(orders.map(serializeOrder)));
});

function serializeCustomer(customer: { toJSON(): unknown }) {
  return customer.toJSON();
}

function serializeOrder(order: { toJSON(): unknown }) {
  return order.toJSON();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default router;
