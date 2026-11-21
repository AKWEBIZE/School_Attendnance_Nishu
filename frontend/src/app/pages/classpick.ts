import { inject } from '@angular/core';
import { Api } from '../api.service';

/** Loads the class list and preselects the teacher's own class. Call from a constructor. */
export function loadClasses(target: { classes: any[]; classId: number | null; onClass: () => void }) {
  const api = inject(Api);
  api.get<any[]>('/classes').subscribe(c => target.classes = c);
  api.get('/me').subscribe(m => { if (m?.class_id) { target.classId = m.class_id; target.onClass(); } });
}
