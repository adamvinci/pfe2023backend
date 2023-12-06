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
Route.get('/users', 'UsersController.index').middleware('isAdmin') // Afficher tous les utilisateurs
Route.get('/users/livreurs', 'UsersController.listLivreurs').middleware('isAdmin') // Afficher la liste des livreurs
Route.post('/users/livreurs', 'UsersController.addLivreur').middleware('isAdmin') // Ajouter un livreur
//AuthController
Route.post('/auth/login', 'AuthController.login')
Route.post('/auth/register', 'AuthController.register').middleware('isAdmin')

//TourneeController
Route.get('/tournees', 'TourneesController.getAll').middleware('auth')
Route.post('/tournees/:idCreche/:idDeliveryMan', 'TourneesController.assignDelivery').middleware('isAdmin')
Route.put('/tournees/updateState/:id', 'TourneesController.updateCommandStateAndQuantity').middleware('auth')

// CrecheController
Route.get('/creches', 'CrechesController.getAll').middleware('isAdmin')
Route.post('/creches', 'CrechesController.createOne').middleware('isAdmin')
Route.post('/creches/:idCreche', 'CrechesController.updateCommand').middleware('isAdmin')

// UserController
Route.get('/users/livreurs', 'UsersController.listLivreurs').middleware('isAdmin') // Afficher la liste des livreurs
Route.post('/users/livreurs', 'UsersController.addLivreur').middleware('isAdmin') // Ajouter un livreur