import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { adminApi } from "@/api/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { EventType } from "@/types/api";

type EventTypeForm = {
  id: string;
  title: string;
  description: string;
  durationMinutes: string;
};

const emptyForm = (): EventTypeForm => ({
  id: "",
  title: "",
  description: "",
  durationMinutes: "30",
});

export function AdminEventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<EventTypeForm>(emptyForm);
  const [editing, setEditing] = useState<EventType | null>(null);
  const [editForm, setEditForm] = useState<EventTypeForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadEventTypes = () =>
    adminApi
      .listEventTypes()
      .then(setEventTypes)
      .catch((err: Error) => setError(err.message));

  useEffect(() => {
    loadEventTypes().finally(() => setLoading(false));
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await adminApi.createEventType({
        id: form.id.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        durationMinutes: Number(form.durationMinutes),
      });
      setForm(emptyForm());
      await loadEventTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать тип события");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;

    setSubmitting(true);
    setError(null);

    try {
      await adminApi.updateEventType(editing.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        durationMinutes: Number(editForm.durationMinutes),
      });
      setEditing(null);
      await loadEventTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить тип события");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Удалить этот тип события?")) return;

    setError(null);
    try {
      await adminApi.deleteEventType(id);
      await loadEventTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить тип события");
    }
  };

  const openEdit = (eventType: EventType) => {
    setEditing(eventType);
    setEditForm({
      id: eventType.id,
      title: eventType.title,
      description: eventType.description,
      durationMinutes: String(eventType.durationMinutes),
    });
  };

  if (loading) {
    return <p className="text-muted-foreground">Загрузка типов событий…</p>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="size-5" />
            Новый тип события
          </CardTitle>
          <CardDescription>
            Задайте id, название, описание и длительность встречи в минутах.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
            <div className="space-y-2">
              <Label htmlFor="id">ID</Label>
              <Input
                id="id"
                value={form.id}
                onChange={(event) => setForm({ ...form, id: event.target.value })}
                placeholder="intro-call"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Название</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Знакомство"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                placeholder="Короткий созвон для знакомства"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Длительность (мин)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={form.durationMinutes}
                onChange={(event) =>
                  setForm({ ...form, durationMinutes: event.target.value })
                }
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Сохранение…" : "Создать"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Список типов событий</CardTitle>
        </CardHeader>
        <CardContent>
          {eventTypes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Типы событий ещё не созданы.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Длительность</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventTypes.map((eventType) => (
                  <TableRow key={eventType.id}>
                    <TableCell className="font-mono text-xs">{eventType.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{eventType.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {eventType.description}
                      </div>
                    </TableCell>
                    <TableCell>{eventType.durationMinutes} мин</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => openEdit(eventType)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => handleDelete(eventType.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование: {editing?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Название</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(event) =>
                  setEditForm({ ...editForm, title: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Описание</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(event) =>
                  setEditForm({ ...editForm, description: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-duration">Длительность (мин)</Label>
              <Input
                id="edit-duration"
                type="number"
                min={1}
                value={editForm.durationMinutes}
                onChange={(event) =>
                  setEditForm({ ...editForm, durationMinutes: event.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Отмена
            </Button>
            <Button disabled={submitting} onClick={handleUpdate}>
              {submitting ? "Сохранение…" : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
