import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleHistorialPage } from './detalle-historial.page';

describe('DetalleHistorialPage', () => {
  let component: DetalleHistorialPage;
  let fixture: ComponentFixture<DetalleHistorialPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleHistorialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
