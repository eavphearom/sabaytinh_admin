import assert from "node:assert/strict";
import test from "node:test";
import { productEditValues, assertNoRemovedProductRecords } from "./productEditModel.js";
import { productFormData } from "./services/productFormData.js";
import { formValues } from "./productFormModel.js";
import { createProductSchema } from "./schemas/productSchema.js";

// Mirror the nested IDs and relative image path returned by Get by ID.
function fixture() {
  return productEditValues({
    id: 6, code: "PRD00006", name: "Nike Air Max", category_id: 1, brand_id: 1, unit_id: 1, is_active: false,
    variants: [{
      id: 3, color_id: 1, sku_prefix: "PRD00006-BLACK", cost: 9, price: 15.99,
      is_default: true, is_active: true,
      images: [{ id: 3, image: "variant/shoe.png", is_primary: true }],
      stocks: [{ id: 3, size_id: 1, unit_id: 1, qty: 60, low_stock_alert: 6 }],
    }],
  }, "http://localhost:8080/api/v1", "http://localhost:5173");
}

test("API detail prefills IDs, status, quantities and image previews", () => {
  const product = fixture();
  assert.equal(product.category, "1");
  assert.equal(product.status, "Inactive");
  assert.equal(product.variants[0].images[0].url, "http://localhost:8080/uploads/images/variant/shoe.png");
  const values = createProductSchema.parse(formValues(product));
  assert.equal(values.variants[0].stocks[0].stock, 60);
  const body = productFormData(values, { update: true });
  assert.equal(body.get("variants[0].id"), "3");
  assert.equal(body.get("variants[0].images[0].id"), "3");
  assert.equal(body.has("variants[0].images[0].image"), false);
  assert.equal(body.get("variants[0].stocks[0].id"), "3");
  assert.equal([...body.keys()].some(key => key.endsWith("unit_id")), false);
  assert.equal(body.get("is_active"), "false");
});

test("edit keeps old images while adding new files", () => {
  const product = fixture();
  const values = formValues(product);
  values.variants[0].images.push({ file: new File(["shoe"], "new.png"), is_primary: false });
  assert.doesNotThrow(() => assertNoRemovedProductRecords(product, values));
  const body = productFormData(values, { update: true });
  assert.equal(body.get("variants[0].images[1].image").name, "new.png");
  values.variants[0].images.shift();
  assert.throws(() => assertNoRemovedProductRecords(product, values), /deletion contract/);
});
