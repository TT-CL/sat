import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceIuComponent } from './source-iu.component';

describe('SourceIuComponent', () => {
  let component: SourceIuComponent;
  let fixture: ComponentFixture<SourceIuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SourceIuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceIuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
