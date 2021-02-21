import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceReaderComponent } from './source-reader.component';

describe('SourceReaderComponent', () => {
  let component: SourceReaderComponent;
  let fixture: ComponentFixture<SourceReaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SourceReaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
