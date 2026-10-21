import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getTask } from "@/lib/admin/cigibm";
import { toDateInput } from "@/lib/cigibm-hub";
import TaskForm from "../../../TaskForm";
import { DeleteTaskButton } from "../../../TaskControls";
import { updateTaskAction } from "../../../actions";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const task = await getTask(id);
  if (!task) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/admin/cigibm?edition=${task.editionNumber}&tab=preparation`} className="text-sm text-leaf-700 underline underline-offset-4">← Préparation de l&apos;édition {task.editionNumber}</Link>
      <h1 className="mt-2 font-display text-2xl text-leaf-900 sm:text-3xl">Modifier la tâche</h1>
      <div className="mt-6">
        <TaskForm
          action={updateTaskAction.bind(null, id)}
          initial={{ title: task.title, category: task.category, dueDate: toDateInput(task.dueDate), owner: task.owner ?? "", notes: task.notes ?? "" }}
          submitLabel="Enregistrer"
        />
      </div>
      <div className="mt-10 border-t border-ink/8 pt-5"><DeleteTaskButton id={id} /></div>
    </div>
  );
}
