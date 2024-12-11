import { Pipe, PipeTransform } from '@angular/core';
import { Contact } from '../common/models/contact.model';
@Pipe({
  name: 'filterByRole'
})
export class FilterByRolePipe implements PipeTransform {
  transform(contactos: Contact[], selectedRole: string): Contact[] {
    if (!selectedRole) return contactos;
    return contactos.filter(contacto => contacto.tipo === selectedRole);
  }
}