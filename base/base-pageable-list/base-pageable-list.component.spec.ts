import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasePageableListComponent } from './base-pageable-list.component';

describe('BaseListComponent', () => {
  let component: BasePageableListComponent;
  let fixture: ComponentFixture<BasePageableListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasePageableListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasePageableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
