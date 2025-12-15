import { inject, Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Injectable()
export class FilterFormService {
    private fb = inject(FormBuilder);

    form  = this.fb.group({
        search: this.fb.control<string>(''),
        platforms: this.fb.array<string>([]),
    });
}