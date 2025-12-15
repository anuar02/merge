import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiProfileModalComponent } from './group-info-modal.component';

describe('TagAssignModalComponent', () => {
    let component: AiProfileModalComponent;
    let fixture: ComponentFixture<AiProfileModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AiProfileModalComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(AiProfileModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
