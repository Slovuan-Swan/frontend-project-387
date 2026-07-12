import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";

test("Гость может забронировать слот", async ({ page }) => {
  const eventTypeId = "test-" + randomUUID().slice(0, 6);
  const eventTitle = "Playwright Test Event " + Date.now();

  let bookingResponse = null;
  page.on("response", async (response) => {
    if (
      response.url().includes("/bookings") &&
      response.request().method() === "POST"
    ) {
      bookingResponse = response;
    }
  });

  await page.goto("/admin/event-types");
  await page.fill("input#id", eventTypeId);
  await page.fill("input#title", eventTitle);
  await page.fill("textarea#description", "Created by Playwright");
  await page.fill("input#duration", "30");
  await page.click('button[type="submit"]');
  await expect(
    page.locator(`table tbody tr:has-text("${eventTypeId}")`),
  ).toBeVisible({ timeout: 10000 });

  await page.goto("/");
  const card = page
    .locator('[data-slot="card"]')
    .filter({ hasText: eventTitle });
  await expect(card).toBeVisible({ timeout: 10000 });
  await card.getByRole("link", { name: "Выбрать время" }).click();

  // Ждём появления кнопок с временем
  await page.waitForSelector("button", {
    hasText: /\d{2}:\d{2}/,
    timeout: 15000,
  });
  const firstSlot = page.locator("button", { hasText: /\d{2}:\d{2}/ }).first();
  await firstSlot.click();

  await page.fill("input#guestName", "Test User");
  await page.fill("input#guestEmail", "test@example.com");
  await page.click('button:has-text("Забронировать")');

  await expect(async () => {
    expect(bookingResponse).not.toBeNull();
    expect(bookingResponse.status()).toBe(200);
  }).toPass({ timeout: 5000 });

  await expect(page.locator("text=Бронирование создано")).toBeVisible({
    timeout: 10000,
  });

  await page.goto("/admin/bookings");
  await page.waitForSelector("table tbody tr", { timeout: 10000 });
  const row = page.locator(`table tbody tr:has-text("${eventTypeId}")`);
  await expect(row).toBeVisible({ timeout: 15000 });
  await expect(row.locator('td:has-text("Test User")')).toBeVisible();
});

test("Повторное бронирование того же слота возвращает ошибку", async ({
  page,
}) => {
  const eventTypeId = "test-conflict-" + randomUUID().slice(0, 6);
  const eventTitle = "Conflict Test " + Date.now();

  let bookingResponse = null;
  page.on("response", async (response) => {
    if (
      response.url().includes("/bookings") &&
      response.request().method() === "POST"
    ) {
      bookingResponse = response;
    }
  });

  await page.goto("/admin/event-types");
  await page.fill("input#id", eventTypeId);
  await page.fill("input#title", eventTitle);
  await page.fill("textarea#description", "Test for conflict");
  await page.fill("input#duration", "30");
  await page.click('button[type="submit"]');
  await expect(
    page.locator(`table tbody tr:has-text("${eventTypeId}")`),
  ).toBeVisible({ timeout: 10000 });

  // Первое бронирование
  await page.goto(`/book/${eventTypeId}`);
  await page.waitForSelector("button", {
    hasText: /\d{2}:\d{2}/,
    timeout: 15000,
  });
  const firstSlot = page.locator("button", { hasText: /\d{2}:\d{2}/ }).first();
  await firstSlot.click();
  await page.fill("input#guestName", "First User");
  await page.fill("input#guestEmail", "first@example.com");
  await page.click('button:has-text("Забронировать")');

  await expect(async () => {
    expect(bookingResponse).not.toBeNull();
    expect(bookingResponse.status()).toBe(200);
  }).toPass({ timeout: 5000 });
  await expect(page.locator("text=Бронирование создано")).toBeVisible({
    timeout: 10000,
  });

  // Сбрасываем для второго запроса
  bookingResponse = null;

  // Повторное бронирование
  await page.goto(`/book/${eventTypeId}`);
  await page.waitForSelector("button", {
    hasText: /\d{2}:\d{2}/,
    timeout: 15000,
  });
  const sameSlot = page.locator("button", { hasText: /\d{2}:\d{2}/ }).first();
  await sameSlot.click();
  await page.fill("input#guestName", "Second User");
  await page.fill("input#guestEmail", "second@example.com");
  await page.click('button:has-text("Забронировать")');

  await expect(async () => {
    expect(bookingResponse).not.toBeNull();
    expect(bookingResponse.status()).toBe(409);
  }).toPass({ timeout: 5000 });

  await expect(page.locator("text=/already booked/i")).toBeVisible({
    timeout: 15000,
  });
});
