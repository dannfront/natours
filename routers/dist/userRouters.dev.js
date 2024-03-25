"use strict";

var express = require('express');

var userHanddler = require('./../controller/userController.js');

var authController = require('./../controller/authController.js');

var userController = require('./../controller/userController.js');

var route = express.Router();
route.post('/signup', authController.signUp);
route.post('/login', authController.login);
route.get('/logout', authController.loggingOut); // route.post('/conmfirmEmail/:token',authController.conmfirmEmail)

route.post('/forgotPassword', authController.forgotPassword);
route.patch('/ResetPassword/:token', authController.resetPassword);
route.patch('/UpdatePassword', authController.protect, authController.UpdatePassword); //middleware de proteccion de rutas
// route.use(authController.protect)
//single es para un solo archivo y se le pasa el nombre del campo del formulario

route.patch('/UpdateMe', userController.updatePhoto, userController.resizePhoto, userController.UpdateMe);
route["delete"]('/DeleteMe', userController.DeleteMe); //obtener los datos del usaurio sin que ponga el id en el url

route.get("/me", userController.me, userController.showUser);
route.use(authController.restricted("admin"));
route.route('/').get(userHanddler.getAllUsers).post(userHanddler.createUser);
route.route('/:id').get(userHanddler.showUser).patch(authController.restricted('admin'), userHanddler.updateUser)["delete"](authController.restricted("admin"), userHanddler.deleteUser);
module.exports = route;