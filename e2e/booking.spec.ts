import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";

const BASE_URL = "http://localhost:3000";

// Генерирует уникальное время: день + сдвиг, час, минута
function getFutureDate(daysOffset: number, hours: number, minutes: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

test("Гость может забронировать слот", async ({ page, request }) => {
  const eventTypeId = "test-" + randomUUID().slice(0, 6);
  const eventTitle = "Playwright Test Event " + Date.now();

  // Создаём тип события через API
  const createTypeRes = await request.post(`${BASE_URL}/admin/event-types`, {
    data: {
      id: eventTypeId,
      title: eventTitle,
      description: "Created by Playwright",
      durationMinutes: 30,
    },
  });
  expect(createTypeRes.status()).toBe(200);

  // Уникальное время: сегодня + 2 дня, 10:00
  const startAt = getFutureDate(2, 10, 0);

  // Создаём бронирование через API
  const bookingRes = await request.post(`${BASE_URL}/bookings`, {
    data: {
      eventTypeId,
      startAt,
      guestName: "Test User",
      guestEmail: "test@example.com",
    },
  });
  expect(bookingRes.status()).toBe(200);

  // Проверяем отображение в админке
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

  // Создаём тип события
  const createTypeRes = await request.post(`${BASE_URL}/admin/event-types`, {
    data: {
      id: eventTypeId,
      title: eventTitle,
      description: "Test for conflict",
      durationMinutes: 30,
    },
  });
  expect(createTypeRes.status()).toBe(200);

  // Уникальное время: сегодня + 3 дня, 11:00
  const startAt = getFutureDate(3, 11, 0);

  // Первое бронирование
  const firstRes = await request.post(`${BASE_URL}/bookings`, {
    data: {
      eventTypeId,
      startAt,
      guestName: "First User",
      guestEmail: "first@example.com",
    },
  });
  expect(firstRes.status()).toBe(200);

  // Второе бронирование (конфликт) – должно вернуть 409
  const secondRes = await request.post(`${BASE_URL}/bookings`, {
    data: {
      eventTypeId,
      startAt,
      guestName: "Second User",
      guestEmail: "second@example.com",
    },
  });
  expect(secondRes.status()).toBe(409);
  const errorBody = await secondRes.json();
  expect(errorBody.code).toBe("slot_unavailable");
  expect(errorBody.message).toContain("already booked");

  // Проверяем, что в админке только первая запись
  await page.goto("/admin/bookings");
  await page.waitForSelector("table tbody tr", { timeout: 10000 });
  const row = page.locator(`table tbody tr:has-text("${eventTypeId}")`);
  await expect(row).toBeVisible({ timeout: 10000 });
  await expect(row.locator('td:has-text("First User")')).toBeVisible();
  await expect(row.locator('td:has-text("Second User")')).not.toBeVisible();
});
