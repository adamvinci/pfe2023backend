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
  const products = await Database.from('product').select('*');
  return { hello: 'testt', products }
})
Route.get('/users', 'UserController.index') // Afficher tous les utilisateurs
Route.get('/users/:id', 'UserController.show') // Afficher un utilisateur spécifique
Route.put('/users/:id', 'UserController.update') // Mettre à jour un utilisateur
Route.delete('/users/:id', 'UserController.destroy') // Supprimer un utilisateur

Route.post('/users/livreurs', 'UserController.storeLivreur') // Ajouter un livreur
Route.get('/users/livreurs', 'UserController.listLivreurs') // Afficher la liste des livreurs