import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";

const BASE_URL = "http://localhost:3000";

test("Гость может забронировать слот", async ({ page, request }) => {
  const eventTypeId = "test-" + randomUUID().slice(0, 6);
  const eventTitle = "Playwright Test Event " + Date.now();

  // 1. Создаём тип события через API
  const createTypeRes = await request.post(`${BASE_URL}/admin/event-types`, {
    data: {
      id: eventTypeId,
      title: eventTitle,
      description: "Created by Playwright",
      durationMinutes: 30,
    },
  });
  expect(createTypeRes.status()).toBe(200);

  // 2. Создаём бронирование через API
  const bookingRes = await request.post(`${BASE_URL}/bookings`, {
    data: {
      eventTypeId,
      startAt: "2026-07-13T10:00:00.000Z",
      guestName: "Test User",
      guestEmail: "test@example.com",
    },
  });
  expect(bookingRes.status()).toBe(200);

  // 3. Переходим в админку и проверяем, что запись отображается
  await page.goto("/admin/bookings");
  await page.waitForSelector("table tbody tr", { timeout: 10000 });
  const row = page.locator(`table tbody tr:has-text("${eventTypeId}")`);
  await expect(row).toBeVisible({ timeout: 15000 });
  await expect(row.locator('td:has-text("Test User")')).toBeVisible();
});

test("Повторное бронирование того же слота возвращает ошибку", async ({
  page,
  request,
}) => {
  const eventTypeId = "test-conflict-" + randomUUID().slice(0, 6);
  const eventTitle = "Conflict Test " + Date.now();

  // 1. Создаём тип события через API
  const createTypeRes = await request.post(`${BASE_URL}/admin/event-types`, {
    data: {
      id: eventTypeId,
      title: eventTitle,
      description: "Test for conflict",
      durationMinutes: 30,
    },
  });
  expect(createTypeRes.status()).toBe(200);

  // 2. Первое бронирование
  const firstRes = await request.post(`${BASE_URL}/bookings`, {
    data: {
      eventTypeId,
      startAt: "2026-07-13T10:00:00.000Z",
      guestName: "First User",
      guestEmail: "first@example.com",
    },
  });
  expect(firstRes.status()).toBe(200);

  // 3. Второе бронирование (конфликт) – должно вернуть 409
  const secondRes = await request.post(`${BASE_URL}/bookings`, {
    data: {
      eventTypeId,
      startAt: "2026-07-13T10:00:00.000Z",
      guestName: "Second User",
      guestEmail: "second@example.com",
    },
  });
  expect(secondRes.status()).toBe(409);
  const errorBody = await secondRes.json();
  expect(errorBody.code).toBe("slot_unavailable");
  expect(errorBody.message).toContain("already booked");

  // 4. Проверяем, что в админке только одна запись (первая)
  await page.goto("/admin/bookings");
  await page.waitForSelector("table tbody tr", { timeout: 10000 });
  const row = page.locator(`table tbody tr:has-text("${eventTypeId}")`);
  await expect(row).toBeVisible({ timeout: 10000 });
  await expect(row.locator('td:has-text("First User")')).toBeVisible();
  await expect(row.locator('td:has-text("Second User")')).not.toBeVisible();
});
