import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock3 } from "lucide-react";

import { publicApi } from "@/api/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EventType } from "@/types/api";

export function GuestEventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    publicApi
      .listEventTypes()
      .then(setEventTypes)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">Загрузка типов событий…</p>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Не удалось загрузить данные</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Выберите тип встречи</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Доступные виды бронирования на ближайшие 14 дней.
        </p>
      </div>

      {eventTypes.length === 0 ? (
        <Alert>
          <AlertTitle>Пока нет доступных типов событий</AlertTitle>
          <AlertDescription>
            Владелец календаря ещё не создал виды встреч.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {eventTypes.map((eventType) => (
            <Card key={eventType.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle>{eventType.title}</CardTitle>
                  <Badge variant="secondary" className="shrink-0 gap-1">
                    <Clock3 className="size-3.5" />
                    {eventType.durationMinutes} мин
                  </Badge>
                </div>
                <CardDescription>{eventType.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1" />
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={`/book/${eventType.id}`}>Выбрать время</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
