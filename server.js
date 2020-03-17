//npm install express       servirdor
//npm install nunjucks      atualizaçãocontinua
//npm install pg            banco de dados
//npm install md5           encript de senha funcionou
// configurabdo o servidor
//ctrl +k + F
const express = require("express")
const server = express()

const md5 = require('md5')

//configurar o servidor para apresentar arquvos extras - arquiovs estáticop
server.use(express.static('public'))
server.use(express.static('images'))

//habilitar body do formulário
server.use(express.urlencoded({ extended: true }))


//configurar a conexão com o banco de dados - POOl mantem a concexão ativa
const Pool = require('pg').Pool
const db = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'usuarios',
    password: '2012',
    port: 5432
})

//cpnfigurando o template engine nunjucks 
const nunjucks = require("nunjucks")
//selecionando a raiz onde tá o index.html
nunjucks.configure("./", {
    express: server,
    noCache: true //para evitar bug

})

//apresentação da Principal INDEX
server.get("/", function (req, res) {
    return res.render("index.html")
    //return res.send("Ok cheguei com nodemon")
})
//Apresentação da Pagina de Registro
server.get("/register.html", function(req,res){
    return res.render("register.html")
})
//Reposta para registro
server.post("/register",function(req,res){
    const msg2 = 'Senha tem que ser no minimo 8 caracteres'
    const msg3 = 'Senhas não coincicidem'
    
    if(!validarsenha()){
        const emailreg =req.body.user.email.toLowerCase()
        const senhareg =md5(req.body.user.password)
        const senhareg2 = md5(req.body.user.password2)
        const namereg = req.body.user.fname +" "+ req.body.user.lname
        const query = 'INSERT INTO userslab ("name", "email", "senha") VALUES ($1, $2, $3)'
        const msg1 = 'Este email já está em uso'
        



        db.query(`SELECT email FROM userslab WHERE email = $1`,[emailreg],function(err,result){
            if (err) return res.send("Erro no banco de dados 1"+ err)
            else{
                if (result.rowCount > 0) {
                    console.log("este email está em uso")
                    return res.render("register.html",{msg1});
                }
                else{     
                    db.query(query,[namereg,emailreg,senhareg],function(err){
                        if(err){return res.send("Erro no banco de dados 2")}
                        return res.redirect("/")
                    })
                }
            }
        })       
    }


    else if(validarsenha()=='1'){
        res.render("register.html",{msg2})
    }

    else if(validarsenha()=='2'){
        res.render("register.html",{msg3})
    }
    function validarsenha(){
        var senha =  req.body.user.password;
        var rep_senha = req.body.user.password2;
        
        if (senha==""|| senha.length<= 7){

            return '1';
        }
        else if(senha!=rep_senha){
            return '2';
        }
        else{
            return false;
            
        }
    }
})
//resposta para Pagina Principal
server.post("/", function (req, res) {
    const email = (req.body.email).toLowerCase()    
    const senha = req.body.senha
    const senhamd5 = md5(senha)
    const status = 'on'
    /*return res.redirect("/")
    * creio que seja com then
    *db.query(`SELECT email, senha, name FROM userslab WHERE email = $1 AND senha = $2`,[email,senhamd5],(err, result) =>{
       console.log(result.rows)
    */
    db.query(`SELECT name FROM userslab WHERE email = $1 AND senha = $2`, [email, senhamd5], function (err, result) {
        if (err) return res.send("Erro no banco de dados")
        else {
            if (result.rowCount > 0) {
                const nomeuser = result.rows[0].name
               // console.log(result.rows)
                //console.log(nomeuser)
                return res.render("tela1.html", { nomeuser })
            }

            else {
                const message = "Senha ou email incorreto"
                // return res.redirect("/")
                return res.render("index.html", { message })
            }
        }


    })// fim da db query
})//fim do post
     
//ligar o servidor
server.listen(3000, function () {
    console.log("Servidor Iniciado")
})

