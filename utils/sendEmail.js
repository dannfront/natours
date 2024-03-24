// bblioteca para enviar correos
const nodeMailer = require('nodemailer')
const pug=require('pug')
const htmlToText=require('html-to-text')
// clase para enviar email
module.exports=class Email {
    // el cosntructor solo toma dos parametros el usuario y la url
    constructor(user, url) {
        // toma el email del usuario porque se le pasa el objeto del usuario
        this.to = user.email
        this.firstName = user.name.split(" ")[0]
        this.url = url
        this.from = `Santiago Daniel <${process.env.EMAIL_FROM}>`
    }

    transport() {
        if (process.env.NODE_ENV === "production") {
            return nodeMailer.createTransport({
                host: process.env.BREVO_HOST,
                port: process.env.BREVO_PORT,
                auth: {
                  user: process.env.BREVO_USERNAME,
                  pass:process.env.BREVO_PASSWORD,
                },
              });
        }
        return  nodeMailer.createTransport({
            //servicio que usaremos para enviar correos
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,

            //autenticacion: desde que dirrecion de correo enviaremos los correos
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
            // 2 definimos las opciones del email

        })
    }

    async send(template,subject){
        //1 renderizar la plantilla pug
        const html=pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
            // varibles que ocuoaremos en la plantilla
            firstName:this.firstName,
            url:this.url,
            subject
        })
        // definir las opcines de email
        const optiosEmail = {
            // desde donde enviaremos el gmail
            from: this.from,
            //datos de adonde se enviara el coreeo
            to: this.to,
            subject,
            // manadamos la plantilla html
            html,
            text: htmlToText.convert(html)
        }

        // enviamos el email, sendMail es del paquete nodeMailer no tiene que ver con la clase
        
        await this.transport().sendMail(optiosEmail)
        
    }

    async sendWelcome(){
        await this.send("welcome","welcome to the Natours Family ")
    }
    async passwordReset(){
        await this.send("passwordReset","Your password reset (valid for only 10 minutes)")
    }
}




