import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";

test("Гость может забронировать слот", async ({ page }) => {
  // 1. Создаём тип события через админку
  const eventTypeId = "test-" + randomUUID().slice(0, 6);
  const eventTitle = "Playwright Test Event";
  await page.goto("/admin/event-types");
  await page.fill("input#id", eventTypeId);
  await page.fill("input#title", eventTitle);
  await page.fill("textarea#description", "Created by Playwright");
  await page.fill("input#duration", "30");
  await page.click('button[type="submit"]');

  // Ждём появления строки в таблице
  await expect(
    page.locator(`table tbody tr:has-text("${eventTypeId}")`),
  ).toBeVisible({ timeout: 10000 });

  // 2. Переходим на главную и выбираем созданный тип
  await page.goto("/");

  // Ищем карточку по заголовку (используем data-slot или текст)
  const card = page
    .locator('[data-slot="card"]')
    .filter({ hasText: eventTitle });
  await expect(card).toBeVisible({ timeout: 10000 });

  // Кликаем по ссылке "Выбрать время" внутри карточки
  await card.getByRole("link", { name: "Выбрать время" }).click();

  // 3. Ждём появления кнопок слотов
  await page.waitForSelector('button:has-text("09:00")', { timeout: 15000 });
  const firstSlot = page.locator('button:has-text("09:00")').first();
  await firstSlot.click();

  // 4. Заполняем форму и отправляем
  await page.fill("input#guestName", "Test User");
  await page.fill("input#guestEmail", "test@example.com");
  await page.click('button:has-text("Забронировать")');

  // 5. Проверяем успешное создание (сообщение появляется в alert или диалоге)
  await expect(page.locator("text=Бронирование создано")).toBeVisible({
    timeout: 10000,
  });

  // 6. Проверяем, что запись появилась в админке
  await page.goto("/admin/bookings");
  const row = page.locator(`table tbody tr:has-text("${eventTypeId}")`);
  await expect(row).toBeVisible({ timeout: 10000 });
  await expect(row.locator('td:has-text("Test User")')).toBeVisible();
});

test("Повторное бронирование того же слота возвращает ошибку", async ({
  page,
}) => {
  // Создаём тип события
  const eventTypeId = "test-conflict-" + randomUUID().slice(0, 6);
  const eventTitle = "Conflict Test";
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
  await page.waitForSelector('button:has-text("09:00")', { timeout: 15000 });
  const firstSlot = page.locator('button:has-text("09:00")').first();
  await firstSlot.click();
  await page.fill("input#guestName", "First User");
  await page.fill("input#guestEmail", "first@example.com");
  await page.click('button:has-text("Забронировать")');
  await expect(page.locator("text=Бронирование создано")).toBeVisible({
    timeout: 10000,
  });

  // Повторное бронирование того же слота
  await page.goto(`/book/${eventTypeId}`);
  await page.waitForSelector('button:has-text("09:00")', { timeout: 15000 });
  const sameSlot = page.locator('button:has-text("09:00")').first();
  await sameSlot.click();
  await page.fill("input#guestName", "Second User");
  await page.fill("input#guestEmail", "second@example.com");
  await page.click('button:has-text("Забронировать")');

  // Ожидаем появления сообщения об ошибке (бэкенд возвращает "Slot already booked")
  await expect(page.locator("text=Slot already booked")).toBeVisible({
    timeout: 10000,
  });
});
