import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { EMPTY, Observable } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';


export interface Task {
  name: string;
  id: string;
}
export interface TaskState {
  task: Task[];
  searchString: string;
  currentTask: Task;
}

@Injectable()
export class TaskStore extends ComponentStore<TaskState> {
  constructor(private taskService: Service) {
    super({
      task: [],
      searchString: '',
      currentTask: null,
    });

    this.fetchTask();
  }

  readonly setTask = this.updater((state, task: Task[]) => ({
    ...state,
    task,
  }));

  public readonly setCurrentTask = this.updater((state, currentTask: Task) => ({
    ...state,
    currentTask,
  }));

  readonly filteredTasks$: Observable<Task[]> = this.select(
    ({ task, searchString }) =>
      task.filter((c) =>
        c.name.toLowerCase().includes(searchString.toLowerCase())
      )
  );

  readonly fetchTask = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap(() =>
        this.taskService.get().pipe(
          tap((task: Task[]) => {
            this.setTask(task);
          }),
          catchError(() => EMPTY)
        )
      )
    )
  );
}
