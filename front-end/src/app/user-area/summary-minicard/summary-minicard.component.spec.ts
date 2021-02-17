import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryMinicardComponent } from './summary-minicard.component';

describe('SummaryMinicardComponent', () => {
  let component: SummaryMinicardComponent;
  let fixture: ComponentFixture<SummaryMinicardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SummaryMinicardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryMinicardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
