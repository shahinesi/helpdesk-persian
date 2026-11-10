import assert from "node:assert/strict";
import test from "node:test";
import { bootstrapErrorMessage } from "./bootstrapError.ts";

test("uses Persian text for Persian locale variants", () => {
  assert.match(bootstrapErrorMessage("fa"), /بارگذاری زبان برنامه/);
  assert.match(bootstrapErrorMessage("fa-IR"), /بارگذاری زبان برنامه/);
});

test("preserves English bootstrap error text for English locale", () => {
  assert.equal(
    bootstrapErrorMessage("en"),
    "The application language could not be loaded. Please reload the page."
  );
});
