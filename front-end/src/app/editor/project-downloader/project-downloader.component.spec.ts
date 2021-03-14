import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDownloaderComponent } from './project-downloader.component';

describe('ProjectDownloaderComponent', () => {
  let component: ProjectDownloaderComponent;
  let fixture: ComponentFixture<ProjectDownloaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectDownloaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDownloaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
