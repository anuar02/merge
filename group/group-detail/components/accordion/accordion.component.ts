import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

import { SvgIconComponent } from '../../../../../../shared/components/svg-icon/svg-icon.component';

@Component({
    selector: 'app-accordion',
    imports: [NgIf, SvgIconComponent],
    templateUrl: './accordion.component.html'
})
export class AccordionComponent {
    @Input() title = '';

    accordionIsActive = true;

    toggleAccordion(): void {
        this.accordionIsActive = !this.accordionIsActive;
    }
}
