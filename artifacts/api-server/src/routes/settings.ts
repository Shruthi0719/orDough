import { Router, type IRouter } from "express";
import { Settings } from "@workspace/db";
import { UpdateSettingsBody, GetSettingsResponse, UpdateSettingsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

async function ensureSettings() {
  const existing = await Settings.find().sort({ updatedAt: 1 });
  if (existing.length === 0) {
    const settings = await Settings.create({
      bakeryName: "orDough",
      tagline: "one more?",
      upiId: "ordough@ybl",
      currency: "₹",
      taxRate: 0,
    });
    return settings;
  }
  return existing[0];
}

router.get("/settings", async (_req, res): Promise<void> => {
  const settings = await ensureSettings();
  res.json(GetSettingsResponse.parse(serializeSettings(settings)));
});

router.patch("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const existing = await ensureSettings();
  const updateData: Record<string, unknown> = {};
  if (parsed.data.bakeryName !== undefined) updateData.bakeryName = parsed.data.bakeryName;
  if (parsed.data.tagline !== undefined) updateData.tagline = parsed.data.tagline;
  if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone;
  if (parsed.data.address !== undefined) updateData.address = parsed.data.address;
  if (parsed.data.upiId !== undefined) updateData.upiId = parsed.data.upiId;
  if (parsed.data.whatsapp !== undefined) updateData.whatsapp = parsed.data.whatsapp;
  if (parsed.data.currency !== undefined) updateData.currency = parsed.data.currency;
  if (parsed.data.taxRate !== undefined) updateData.taxRate = parsed.data.taxRate;

  const settings = await Settings.findByIdAndUpdate(existing.id, updateData, {
    new: true,
    runValidators: true,
  });
  res.json(UpdateSettingsResponse.parse(serializeSettings(settings)));
});

function serializeSettings(settings: { toJSON(): unknown } | null) {
  return settings?.toJSON();
}

export default router;
