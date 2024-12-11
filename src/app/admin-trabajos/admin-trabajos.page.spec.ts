import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminTrabajosPage } from './admin-trabajos.page';

describe('AdminTrabajosPage', () => {
  let component: AdminTrabajosPage;
  let fixture: ComponentFixture<AdminTrabajosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTrabajosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
