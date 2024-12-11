import { Pipe, PipeTransform } from '@angular/core';
import { Contact } from '../common/models/contact.model'; // Asegúrate de que la ruta sea correcta

@Pipe({
  name: 'tipoContacto'
})
export class TipoContactoPipe implements PipeTransform {
  transform(contactos: Contact[], tipo: string): Contact[] {
    if (!contactos || !tipo) {
      return contactos;
    }
    // Filtrar contactos por tipo
    return contactos.filter(contacto => contacto.tipo === tipo);
  }
}
