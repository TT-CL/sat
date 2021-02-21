import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryReaderComponent } from './summary-reader.component';

describe('SummaryReaderComponent', () => {
  let component: SummaryReaderComponent;
  let fixture: ComponentFixture<SummaryReaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SummaryReaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
