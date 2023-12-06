/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import Database from '@ioc:Adonis/Lucid/Database'

Route.get('/', async () => {
  const products = await Database.from('beds').select('*');
  return { hello: 'testt',products}
})
Route.get('/users', 'UsersController.index') // Afficher tous les utilisateurs
Route.get('/users/:id', 'UsersController.show') // Afficher un utilisateur spécifique
Route.get('/users/livreurs', 'UsersController.listLivreurs') // Afficher la liste des livreurs
Route.put('/users/:id', 'UsersController.update') // Mettre à jour un utilisateur
Route.delete('/users/:id', 'UsersController.destroy') // Supprimer un utilisateur

Route.post('/users/livreurs', 'UsersController.addLivreur') // Ajouter un livreur
Route.post('/auth/login', 'AuthController.login')
Route.post('/auth/register', 'AuthController.register').middleware('isAdmin')
