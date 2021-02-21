import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryIuComponent } from './summary-iu.component';

describe('SummaryIuComponent', () => {
  let component: SummaryIuComponent;
  let fixture: ComponentFixture<SummaryIuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SummaryIuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryIuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
