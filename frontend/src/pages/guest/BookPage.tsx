import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { addDays, format, parseISO, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { ArrowLeft, CalendarDays } from "lucide-react";

import { publicApi } from "@/api/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, type AvailableSlot, type EventType } from "@/types/api";

export function GuestBookPage() {
  const { id = "" } = useParams();
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    Promise.all([
      publicApi.getEventType(id),
      publicApi.getAvailability({ eventTypeId: id }),
    ])
      .then(([loadedEventType, loadedSlots]) => {
        setEventType(loadedEventType);
        setSlots(loadedSlots);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const slotsByDay = useMemo(() => {
    const grouped = new Map<string, AvailableSlot[]>();

    for (const slot of slots) {
      const dayKey = format(parseISO(slot.startAt), "yyyy-MM-dd");
      const daySlots = grouped.get(dayKey) ?? [];
      daySlots.push(slot);
      grouped.set(dayKey, daySlots);
    }

    return [...grouped.entries()].sort(([left], [right]) =>
      left.localeCompare(right),
    );
  }, [slots]);

  const handleSubmit = async () => {
    if (!eventType || !selectedSlot) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await publicApi.createBooking({
        eventTypeId: eventType.id,
        startAt: selectedSlot.startAt,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
      });
      setSuccess(true);
      setSelectedSlot(null);
      setGuestName("");
      setGuestEmail("");
      const refreshedSlots = await publicApi.getAvailability({
        eventTypeId: eventType.id,
      });
      setSlots(refreshedSlots);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Не удалось создать бронирование";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Загрузка календаря…</p>;
  }

  if (error || !eventType) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline" size="sm">
          <Link to="/">
            <ArrowLeft className="size-4" />
            Назад
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>
            {error ?? "Тип события не найден"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button asChild variant="outline" size="sm" className="mb-4">
            <Link to="/">
              <ArrowLeft className="size-4" />К типам событий
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            {eventType.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {eventType.description}
          </p>
        </div>
        <Badge variant="secondary">{eventType.durationMinutes} мин</Badge>
      </div>

      {success && (
        <Alert>
          <AlertTitle>Бронирование создано</AlertTitle>
          <AlertDescription>
            Встреча успешно забронирована. Вы можете выбрать ещё один слот.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="size-5" />
            Свободные слоты
          </CardTitle>
          <CardDescription>
            Окно записи: с{" "}
            {format(startOfDay(new Date()), "d MMMM", { locale: ru })} по{" "}
            {format(addDays(startOfDay(new Date()), 14), "d MMMM yyyy", {
              locale: ru,
            })}
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {slotsByDay.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Свободных слотов пока нет. Попробуйте позже.
            </p>
          ) : (
            slotsByDay.map(([dayKey, daySlots]) => (
              <div key={dayKey} className="space-y-3">
                <h2 className="text-sm font-medium">
                  {format(parseISO(dayKey), "EEEE, d MMMM", { locale: ru })}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((slot) => (
                    <Button
                      key={slot.startAt}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSuccess(false);
                        setSubmitError(null);
                        setSelectedSlot(slot);
                      }}
                    >
                      {format(parseISO(slot.startAt), "HH:mm")}
                    </Button>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedSlot)}
        onOpenChange={(open) => !open && setSelectedSlot(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение бронирования</DialogTitle>
            <DialogDescription>
              {selectedSlot &&
                `${format(parseISO(selectedSlot.startAt), "d MMMM yyyy, HH:mm", { locale: ru })} — ${format(parseISO(selectedSlot.endAt), "HH:mm")}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guestName">Ваше имя</Label>
              <Input
                id="guestName"
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                placeholder="Иван Иванов"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guestEmail">Email</Label>
              <Input
                id="guestEmail"
                type="email"
                value={guestEmail}
                onChange={(event) => setGuestEmail(event.target.value)}
                placeholder="ivan@example.com"
              />
            </div>
            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSlot(null)}>
              Отмена
            </Button>
            <Button
              disabled={submitting || !guestName.trim() || !guestEmail.trim()}
              onClick={handleSubmit}
            >
              {submitting ? "Сохранение…" : "Забронировать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
