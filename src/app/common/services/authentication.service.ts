import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database'; // Importar AngularFireDatabase
import { ref, set, get } from '@firebase/database'; // Importar set y get para obtener y guardar datos
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Observable ,combineLatest, of} from 'rxjs';
import { map , switchMap } from 'rxjs/operators';



@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private basePath = 'trabajosPosteados';

  constructor(
    public ngFireAuth: AngularFireAuth,
    private db: AngularFireDatabase, // Inyectar AngularFireDatabase
    private router: Router,
    private toastController: ToastController
  ) {}

  async registerUser(email: string, password: string, additionalData: any) {
    // Crear usuario
    const userCredential = await this.ngFireAuth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Guardar datos adicionales en Realtime Database
    if (user) {
      await set(ref(this.db.database, 'users/' + user.uid), {
        email: user.email,
        ...additionalData,
        role:'cliente' // Aquí se pueden agregar más datos si es necesario
      });
    }

    return userCredential;
  }

  async loginUser(email: string, password: string) {
    return await this.ngFireAuth.signInWithEmailAndPassword(email, password);
  }

  async signOut() {
    return await this.ngFireAuth.signOut();
  }

  async getProfile() {
    return await this.ngFireAuth.currentUser;
  }

  async getUserData(userId: string): Promise<any> {
    const userRef = this.db.object(`users/${userId}`);
    return firstValueFrom(userRef.valueChanges());
  }
  

  // Métodos para el reset de contraseña

  async resetPass(email: string): Promise<void> {
    try {
      // Envío del correo de recuperación de contraseña con Firebase Auth
      await this.ngFireAuth.sendPasswordResetEmail(email);

      // Guarda el estado en Realtime Database
      const userRef = this.db.object(`RecuperarContrasena/${btoa(email)}`);
      userRef.set({
        email,
        requestDate: new Date().toISOString(),
        status: 'pending',
      });

      this.presentToast('Correo de recuperación enviado', 'success');
    } catch (error) {
      console.error('Error al enviar el correo de recuperación', error);
      this.presentToast('Error al enviar el correo', 'danger');
    }
  }

  // Método para mostrar un mensaje de toast
  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2000,
    });
    toast.present();
  }

  // Método para verificar el estado de la solicitud de recuperación en la base de datos
  getRecoveryStatus(email: string) {
    const userRef = this.db.object(`RecuperarContrasena/${btoa(email)}`);
    return userRef.valueChanges(); // Devuelve un observable para escuchar los cambios
  }

  async resetPassword(email: string) {
    return await this.ngFireAuth.sendPasswordResetEmail(email);
  }
  
  getCurrentUser() {
    return this.ngFireAuth.authState;
  }

  //METODOS ADMIN

  //Metodo para contar Trabajos registrados
  async getTrabajosCount(): Promise<number> {
    try {
      const trabajos = await firstValueFrom(this.db.list('trabajosPosteados').valueChanges());
      return trabajos.length;
    } catch (error) {
      console.error('Error al obtener trabajos:', error);
      return 0; 
    }
  }

  // Método para contar usuarios registrados
  async getUsersCount(): Promise<number> {
    try {
      const users = await firstValueFrom(this.db.list('users').valueChanges());
      return users.length;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return 0; 
    }
  }
  //ADMIN TRABAJOS
  getTrabajos(): Observable<any[]> {
    return this.db.list('trabajosPosteados').snapshotChanges().pipe(
      switchMap((acciones: any[]) => {
        const trabajosConNombres$ = acciones.map(accion => {
          const trabajo = accion.payload.val();
          const trabajoId = accion.payload.key; // Obtén la clave única del trabajo
          const creadorId = trabajo.creadorId;
  
          // Obtén el nombre completo del creador
          return this.db.object(`users/${creadorId}`).valueChanges().pipe(
            map((creador: any) => {
              const creadorNombre = creador ? `${creador.name} ${creador.lastName}` : 'Desconocido';
              return { ...trabajo, creadorNombre, id: trabajoId }; // Incluye el ID en el resultado
            })
          );
        });
  
        return combineLatest(trabajosConNombres$);
      })
    );
  }
  
    updateTrabajo(id: string, trabajo: any) {
      return this.db.object(`trabajosPosteados/${id}`).update(trabajo);
    }
    
  

  // Eliminar un trabajo
  deleteTrabajo(id: string) {
    return this.db.object(`${this.basePath}/${id}`).remove();
  }
  getUsers(): Observable<any[]> {
    return this.db.list('users').snapshotChanges().pipe(
      map((users: any[]) => {
        return users.map(user => {
          const userData = user.payload.val(); // Los datos del usuario
          const key = user.key; // La clave del usuario (ID)
  
          return {
            name: userData.name,
            lastName: userData.lastName,
            lastnamef: userData.lastnamef,
            comunas: userData.comunas,
            rut: userData.rut,
            phone: userData.phone,
            profilePhotoUrl: userData.profilePhotoUrl || 'defaultProfilePhotoUrl', // Foto de perfil
            key: key // Añadir la key para facilitar la eliminación
          };
        });
      })
    );
  }

  // Eliminar usuario de Realtime Database y Firebase Authentication
  async deleteUser(uid: string): Promise<void> {
    try {
      // Paso 1: Eliminar los datos del usuario en Realtime Database
      await this.db.object(`users/${uid}`).remove();
      console.log('Datos de usuario eliminados de Realtime Database');
      
      // Paso 2: Eliminar la cuenta de Firebase Authentication
      const user = await this.ngFireAuth.currentUser;
      if (user) {
        await user.delete();
        console.log('Cuenta eliminada de Firebase Authentication');
      }
    } catch (error) {
      console.error('Error eliminando el usuario:', error);
      throw error;
    }
  }
}
