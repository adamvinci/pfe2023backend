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

Route.get('/', async () => {
  return { hello: 'hello' }
})

//AuthController
Route.post('/auth/login', 'AuthController.login')
Route.post('/auth/register', 'AuthController.register').middleware('isAdmin') // Allow the admin to add a delivery man
Route.post('/auth/updatePassword', 'AuthController.updatePassword').middleware('isAdmin') // Allow the admin to change users passwords
Route.post('/auth/resetPasswordAdmin', 'AuthController.forgotPassword') // Send a new password to the admin 

//TourneeController
Route.get('/tournees', 'TourneesController.getAll').middleware('auth') // Send all the delivery 
Route.get('/tournees/:id', 'TourneesController.getOne').middleware('auth') // getOne delivery
Route.post('/tournees', 'TourneesController.createOne').middleware('isAdmin') // Create a delivery and add nursery to this delivery
Route.delete('/tournees/:id', 'TourneesController.deleteOne').middleware('isAdmin')
Route.post('/tournees/updateState', 'TourneesController.updateDeliveryQuantity').middleware('auth')// update the extra quanity in the deliveryMan truck
Route.post('/tournees/updateOne', 'TourneesController.updateOne').middleware('isAdmin') // update the nursery the name and the delivery man of a delivery

// CrecheController
Route.get('/creches', 'CrechesController.getAll').middleware('isAdmin') // Return all the nursery
Route.get('/creches/:id', 'CrechesController.getOne').middleware('auth') // Return one the nursery
Route.post('/creches', 'CrechesController.createOne').middleware('isAdmin') // Create one nursery
Route.post('/creches/:idCreche', 'CrechesController.addNurseryCommand').middleware('isAdmin') // Add the quantity of box asked by the nursery
Route.delete('/creche/:id', 'CrechesController.deleteOne').middleware('isAdmin')
Route.delete('/creche/fromTournee/:id', 'CrechesController.deleteFromTournee').middleware('isAdmin')

// UserController
Route.get('/users', 'UsersController.listLivreurs').middleware('isAdmin') // Show all the delivery man to the admin 
Route.get('/users/delivery', 'UsersController.getDelivery').middleware('auth') // Allow the user to see all the delivery assigned today, admin can see all delivery with a delivery man assigned today 
Route.delete('/users/:id', 'UsersController.deleteOne').middleware('isAdmin')
Route.post('/users/assignDelivery', 'UsersController.chooseDelivery').middleware('auth') // Allow delivery man to choose a delivery