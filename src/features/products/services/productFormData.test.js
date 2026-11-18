import assert from "node:assert/strict";
import test from "node:test";
import { productFormData } from "./productFormData.js";
import { createProductSchema } from "../schemas/productSchema.js";

function values() {
  return {
    name: " Runner ",
    category: "1",
    brand: "2",
    description: "",
    status: "Active",
    variants: [1, 2].map((id, i) => ({
      color: String(id),
      cost: "8",
      price: "14.99",
      is_default: i === 0,
      images: [0, 1].map((j) => ({
        file: new File(["image"], id + "-" + j + ".png", { type: "image/png" }),
        is_primary: j === 0,
      })),
      stocks: [
        { size: "3", stock: "50", lowStock: "5" },
        { size: "4", stock: "0", lowStock: "0" },
      ],
    })),
  };
}

test("create allows generated codes and serializes every variant using backend keys", () => {
  const data = productFormData(createProductSchema.parse(values()));
  assert.equal(data.get("name"), "Runner");
  assert.equal(data.get("category_id"), "1");
  assert.equal(data.get("brand_id"), "2");
  assert.equal(data.has("code"), false);
  assert.equal(data.get("variants[0].cost"), "8");
  assert.equal(data.get("variants[1].price"), "14.99");
  assert.equal(data.get("variants[0].is_default"), "true");
  assert.equal(data.get("variants[1].is_default"), "false");
  assert.equal(data.get("variants[1].images[1].image").name, "2-1.png");
  assert.equal(data.get("variants[1].images[1].is_primary"), "false");
  assert.equal(data.get("variants[1].stocks[1].size_id"), "4");
  assert.equal(data.get("variants[1].stocks[1].qty"), "0");
  assert.equal(data.get("variants[1].stocks[1].low_stock_alert"), "0");
});

test("inactive state and invalid create data are handled", () => {
  const value = values();
  value.status = "Inactive";
  assert.equal(
    productFormData(createProductSchema.parse(value)).get("is_active"),
    "false",
  );
  value.variants[1].color = "1";
  assert.equal(createProductSchema.safeParse(value).success, false);
  value.variants[1].color = "2";
  value.variants[0].stocks[0].stock = "1.5";
  assert.equal(createProductSchema.safeParse(value).success, false);
});

test("preview URLs cannot be uploaded as files", () => {
  const value = values();
  value.variants[0].images[0] = { url: "blob:preview", is_primary: true };
  assert.throws(() => productFormData(value), /Select a file/);
});
