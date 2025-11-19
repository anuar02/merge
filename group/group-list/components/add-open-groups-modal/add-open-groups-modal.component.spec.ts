import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOpenGroupsModalComponent } from './add-open-groups-modal.component';

describe('AddOpenGroupsModalComponent', () => {
  let component: AddOpenGroupsModalComponent;
  let fixture: ComponentFixture<AddOpenGroupsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOpenGroupsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOpenGroupsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
