import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";

test("Гость может забронировать слот", async ({ page }) => {
  const eventTypeId = "test-" + randomUUID().slice(0, 6);
  const eventTitle = "Playwright Test Event " + Date.now();

  // 1. Создаём тип события через админку
  await page.goto("/admin/event-types");
  await page.fill("input#id", eventTypeId);
  await page.fill("input#title", eventTitle);
  await page.fill("textarea#description", "Created by Playwright");
  await page.fill("input#duration", "30");
  await page.click('button[type="submit"]');

  // Ждём, пока строка с этим ID появится в таблице
  await expect(
    page.locator(`table tbody tr:has-text("${eventTypeId}")`),
  ).toBeVisible({ timeout: 15000 });

  // 2. Переходим на главную и выбираем созданный тип
  await page.goto("/");
  const card = page
    .locator('[data-slot="card"]')
    .filter({ hasText: eventTitle });
  await expect(card).toBeVisible({ timeout: 15000 });
  await card.getByRole("link", { name: "Выбрать время" }).click();

  // 3. Выбираем первый доступный слот (09:00)
  await page.waitForSelector('button:has-text("09:00")', { timeout: 20000 });
  const firstSlot = page.locator('button:has-text("09:00")').first();
  await firstSlot.click();

  // 4. Заполняем форму и отправляем
  await page.fill("input#guestName", "Test User");
  await page.fill("input#guestEmail", "test@example.com");
  await page.click('button:has-text("Забронировать")');

  // 5. Проверяем успешное создание (уведомление)
  await expect(page.locator("text=Бронирование создано")).toBeVisible({
    timeout: 15000,
  });

  // 6. Проверяем, что запись появилась в админке
  await page.goto("/admin/bookings");
  // Ждём, пока таблица загрузится
  await page.waitForSelector("table tbody tr", { timeout: 10000 });
  // Ищем строку с нашим eventTypeId
  const row = page.locator(`table tbody tr:has-text("${eventTypeId}")`);
  await expect(row).toBeVisible({ timeout: 15000 });
  await expect(row.locator('td:has-text("Test User")')).toBeVisible();
});

test("Повторное бронирование того же слота возвращает ошибку", async ({
  page,
}) => {
  const eventTypeId = "test-conflict-" + randomUUID().slice(0, 6);
  const eventTitle = "Conflict Test " + Date.now();

  // Создаём тип события
  await page.goto("/admin/event-types");
  await page.fill("input#id", eventTypeId);
  await page.fill("input#title", eventTitle);
  await page.fill("textarea#description", "Test for conflict");
  await page.fill("input#duration", "30");
  await page.click('button[type="submit"]');
  await expect(
    page.locator(`table tbody tr:has-text("${eventTypeId}")`),
  ).toBeVisible({ timeout: 15000 });

  // Первое бронирование
  await page.goto(`/book/${eventTypeId}`);
  await page.waitForSelector('button:has-text("09:00")', { timeout: 20000 });
  const firstSlot = page.locator('button:has-text("09:00")').first();
  await firstSlot.click();
  await page.fill("input#guestName", "First User");
  await page.fill("input#guestEmail", "first@example.com");
  await page.click('button:has-text("Забронировать")');
  await expect(page.locator("text=Бронирование создано")).toBeVisible({
    timeout: 15000,
  });

  // Перезагружаем страницу бронирования, чтобы закрыть диалог успеха
  await page.goto(`/book/${eventTypeId}`);
  // Ждём, пока появятся кнопки слотов снова
  await page.waitForSelector('button:has-text("09:00")', { timeout: 20000 });

  // Повторно выбираем тот же слот
  const sameSlot = page.locator('button:has-text("09:00")').first();
  await sameSlot.click();
  await page.fill("input#guestName", "Second User");
  await page.fill("input#guestEmail", "second@example.com");
  await page.click('button:has-text("Забронировать")');

  // Ждём появления сообщения об ошибке (может быть в диалоге или alert)
  // Ищем по тексту "already booked" (регистронезависимо) на всей странице
  const errorLocator = page.locator("text=/already booked/i");
  await expect(errorLocator).toBeVisible({ timeout: 15000 });

  // Дополнительно проверим, что это не сообщение об успехе
  await expect(page.locator("text=Бронирование создано")).not.toBeVisible();
});
