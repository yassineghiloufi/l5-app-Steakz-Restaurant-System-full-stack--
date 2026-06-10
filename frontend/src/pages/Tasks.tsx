import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { getAuthContext } from '../utils/auth';
import api from '../api';

const TASK_EDIT_ROLES = ['SUPER_ADMIN', 'CHAIN_OWNER', 'BRANCH_MANAGER', 'OPERATIONS_DIRECTOR', 'SUPERVISOR'];
const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

const Tasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [taskUpdates, setTaskUpdates] = useState<Record<string, { status: string; assignedTo: string }>>({});

  const auth = getAuthContext();
  const canManageTasks = Boolean(
    auth &&
      (TASK_EDIT_ROLES.includes(auth.primaryRole) ||
        auth.roleNames.some((role) => TASK_EDIT_ROLES.includes(role))),
  );

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.data.tasks);
      setTaskUpdates(
        response.data.data.tasks.reduce((acc: Record<string, { status: string; assignedTo: string }>, task: any) => {
          acc[task.id] = { status: task.status, assignedTo: task.assignedTo?.id || '' };
          return acc;
        }, {}),
      );
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data.users);
      if (!assignedTo && response.data.data.users.length > 0) {
        setAssignedTo(response.data.data.users[0].id);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (canManageTasks) {
      loadUsers();
    }
  }, [canManageTasks]);

  const statusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'IN_PROGRESS':
        return 'In progress';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  const handleUpdateTask = async (taskId: string) => {
    setError(null);
    setMessage(null);
    setSavingTaskId(taskId);
    try {
      const update = taskUpdates[taskId];
      await api.put(`/tasks/${taskId}`, {
        status: update.status,
        assignedTo: update.assignedTo,
      });
      setMessage('Task updated successfully.');
      await loadTasks();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to update task.');
    } finally {
      setSavingTaskId(null);
    }
  };

  const handleCreateTask = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!title.trim() || !description.trim() || !assignedTo) {
      setError('Title, description, and assignee are required.');
      return;
    }

    setCreating(true);
    try {
      await api.post('/tasks', {
        title: title.trim(),
        description: description.trim(),
        assignedTo,
      });
      setTitle('');
      setDescription('');
      setMessage('Task created successfully.');
      await loadTasks();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to create task.');
    } finally {
      setCreating(false);
    }
  };

  const filteredTasks = useMemo(() => tasks, [tasks]);

  const handleTaskFieldChange = (taskId: string, field: 'status' | 'assignedTo', value: string) => {
    setTaskUpdates((current) => ({
      ...current,
      [taskId]: {
        ...current[taskId],
        [field]: value,
      },
    }));
  };

  return (
    <div className="mx-auto max-w-7xl py-8 px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Task Management</h1>
          <p className="mt-2 text-slate-600">Review assigned tasks, update statuses, and create new task assignments when appropriate.</p>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-900">
          {error}
        </div>
      )}
      {message && (
        <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900">
          {message}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Assigned tasks</h2>
                <p className="mt-1 text-sm text-slate-500">{tasks.length} tasks loaded.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-700">{canManageTasks ? 'Editable' : 'Read-only'}</span>
            </div>

            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-600">Loading tasks...</div>
              ) : filteredTasks.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-600">No tasks available.</div>
              ) : (
                filteredTasks.map((task) => (
                  <div key={task.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="text-lg font-semibold text-slate-900">{task.title}</div>
                        <p className="mt-2 text-sm text-slate-600">{task.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                          <span className="rounded-full bg-white px-3 py-1 shadow-sm">Status: {statusLabel(task.status)}</span>
                          <span className="rounded-full bg-white px-3 py-1 shadow-sm">Assigned to: {task.assignedTo?.name || 'Unknown'}</span>
                        </div>
                      </div>
                      {canManageTasks && (
                        <div className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-sm">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</label>
                            <select
                              value={taskUpdates[task.id]?.status || task.status}
                              onChange={(event) => handleTaskFieldChange(task.id, 'status', event.target.value)}
                              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                            >
                              {TASK_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {statusLabel(status)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Assignee</label>
                            <select
                              value={taskUpdates[task.id]?.assignedTo || task.assignedTo?.id || ''}
                              onChange={(event) => handleTaskFieldChange(task.id, 'assignedTo', event.target.value)}
                              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                            >
                              <option value="">Select assignee</option>
                              {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.name}
                                </option>
                              ))}
                              {users.length === 0 && task.assignedTo?.id && (
                                <option value={task.assignedTo.id}>{task.assignedTo.name}</option>
                              )}
                            </select>
                            {users.length === 0 && (
                              <p className="mt-2 text-xs text-slate-500">Assigning users is not available. Your current assignee will remain unchanged.</p>
                            )}
                          </div>
                          <button
                            type="button"
                            disabled={savingTaskId === task.id}
                            onClick={() => handleUpdateTask(task.id)}
                            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                          >
                            {savingTaskId === task.id ? 'Saving...' : 'Save changes'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">New task</h2>
                <p className="mt-1 text-sm text-slate-500">Create a task and assign it to a team member.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-700">
                {canManageTasks ? 'Available' : 'Restricted'}
              </span>
            </div>

            {!canManageTasks ? (
              <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-sm text-slate-600">
                You do not have permission to assign or update tasks.
              </div>
            ) : (
              <form onSubmit={handleCreateTask} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Task title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setTitle(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                    placeholder="e.g. Review inventory audit"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    value={description}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setDescription(event.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                    placeholder="Detail the task assignment"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Assign to</label>
                  <select
                    value={assignedTo}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => setAssignedTo(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="">Select assignee</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  {users.length === 0 && (
                    <p className="mt-2 text-xs text-slate-500">Unable to load users. Task creation requires permission to view users.</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={creating || users.length === 0}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {creating ? 'Creating...' : 'Create task'}
                </button>
              </form>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Tasks;
