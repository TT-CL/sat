import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectEditFormComponent } from './project-edit-form.component';

describe('ProjectEditFormComponent', () => {
  let component: ProjectEditFormComponent;
  let fixture: ComponentFixture<ProjectEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectEditFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectEditFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
