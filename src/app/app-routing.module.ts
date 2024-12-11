import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { RoleGuard } from './authentication.guard';


const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule) },
  { path: 'signup', loadChildren: () => import('./signup/signup.module').then(m => m.SignupPageModule) },
  { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },   {
    path: 'landing',
    loadChildren: () => import('./landing/landing.module').then( m => m.LandingPageModule)
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./reset-password/reset-password.module').then( m => m.ResetPasswordPageModule)
  },
  {
    path: 'crear-servicio',
    loadChildren: () => import('./crear-servicio/crear-servicio.module').then( m => m.CrearServicioPageModule)
  },
  {
    path: 'cloudstorage',
    loadChildren: () => import('./cloudstorage/cloudstorage.module').then( m => m.CloudstoragePageModule)
  },
  {
    path: 'detalle-trabajo',
    loadChildren: () => import('./detalle-trabajo/detalle-trabajo.module').then( m => m.DetalleTrabajoPageModule)
  },
  {
    path: 'notificaciones',
    loadChildren: () => import('./notificaciones/notificaciones.module').then( m => m.NotificacionesPageModule)
  },
  {
    path: 'historial',
    loadChildren: () => import('./historial/historial.module').then( m => m.HistorialPageModule)
  },
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then( m => m.ChatPageModule)
  },
  {
    path: 'contactos',
    loadChildren: () => import('./contactos/contactos.module').then( m => m.ContactosPageModule)
  },
  {
    path: 'perfil',
    loadChildren: () => import('./perfil/perfil.module').then( m => m.PerfilPageModule)
  },
  {
    path: 'perfil',
    loadChildren: () => import('./perfil/perfil.module').then( m => m.PerfilPageModule)
  },
  {
    path: 'detalle-historial',
    loadChildren: () => import('./detalle-historial/detalle-historial.module').then( m => m.DetalleHistorialPageModule)
  },
  {
    path: 'testcontrato',
    loadChildren: () => import('./testcontrato/testcontrato.module').then( m => m.TestcontratoPageModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then( m => m.AdminPageModule) , canActivate: [RoleGuard]
  },
  {
    path: 'admin-users',
    loadChildren: () => import('./admin-users/admin-users.module').then( m => m.AdminUsersPageModule) , canActivate: [RoleGuard]
  },
  {
    path: 'admin-trabajos',
    loadChildren: () => import('./admin-trabajos/admin-trabajos.module').then( m => m.AdminTrabajosPageModule) , canActivate: [RoleGuard]
  },
  {
    path: 'editarperfil',
    loadChildren: () => import('./editarperfil/editarperfil.module').then( m => m.EditarperfilPageModule)
  },
  {
    path: 'detallecontrato/:id', // Asegúrate de que el parámetro sea dinámico
    loadChildren: () => import('./detallecontrato/detallecontrato.module').then(m => m.DetallecontratoPageModule)
  },
  {
    path: 'rating-modal',
    loadChildren: () => import('./rating-modal/rating-modal.module').then( m => m.RatingModalPageModule)
  },
  {
    path: 'resultadobusqueda',
    loadChildren: () => import('./resultadobusqueda/resultadobusqueda.module').then( m => m.ResultadobusquedaPageModule)
  },
  {
    path: 'premium',
    loadChildren: () => import('./premium/premium.module').then( m => m.PremiumPageModule)
  },
// Nueva ruta HOME
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
