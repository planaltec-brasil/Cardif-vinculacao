const puppeteer = require('puppeteer');
var fs = require('fs');
const xlsx = require('xlsx');
var axios = require ('axios');
let validados = [];
let adicionar = []
var iDados = 0;
var dados = [];

const workbook = xlsx.readFile('./comunicado.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

let posts = [];

module.exports = class cardifSeg {
    // constructor(obj) {
    //     for(let cell in worksheet) {
    //         const cellAsString = cell.toString()

    //             if(cellAsString[0] === 'H' && worksheet[cell].v !== 'SINISTRO'){
    //                 var post = {};
    //                 post.SINISTRO = worksheet[cell].v;
    //                 posts.push(post);
    //             }
    //     }
    // }  
    async verificaSinistro(e){
        let ip = await axios.post("https://gsplanaltec.com/consultaBot/",
            {
                sqlQuery:`SELECT Sinistro FROM importados_zurich WHERE Sinistro = '${e.Sinistro}' AND id_emp IN ('2','88','106','108','109','143')`
            },
        {
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
            },
        }).then(function(response) {
            return response.data;
        }).catch(function (error) {
            console.error(error);
        });
        return ip;
    }
    async iniciaLuiza(website, dadosTerminal) {
        for (let i = 0; i < 250; i++) {
            const wb = xlsx.readFile("comunicado.xlsx");
            const ws = wb.Sheets[wb.SheetNames[0]];
            let data = xlsx.utils.sheet_to_json(ws);
            let { SINISTRO, LINHA } = data[i];
            let objNovo = {
                Sinistro: SINISTRO,
                Linha: LINHA
            };
            validados.push(objNovo);
        }
    
        for (const e of validados) {
            if (e.Sinistro != undefined) {
                let verificacao = await this.verificaSinistro(e);
                if (verificacao.length == 0) {
                    adicionar.push(e);
                }
            }
        }
    
        if (adicionar.length == 0) {
            console.log("Sem registros novos!");
            return;
        }
    
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.waitForTimeout(15000);
        console.log('Finalizou');
        console.log(adicionar);
    
        if (adicionar.length == 0) {
            console.log("Sem registros novos!");
            return;
        }
    
        await page.goto(website);
        console.log("CARDIF");
        await page.type('#usr_login', 'assistU14727');
        await page.waitForTimeout(2000);
        await page.type('#usr_password', 'G4aranti@');
        await page.waitForTimeout(2000);
        await page.click('input[name=new_login]');
    
        await page.waitForTimeout(15000);
    
        this.listagem(page, dadosTerminal, adicionar, 0);
    }
    
    async listagem(page, dadosTerminal, arr, i) {
        try{
        //MEU CODIGO AQUI
        await page.waitForTimeout(5000);
        let sinistroInput = arr[i].Sinistro;
        sinistroInput = sinistroInput.toString();
        console.log(sinistroInput);
        // return;
        console.log(i);
        await page.waitForSelector('#SearchTicket');
        await page.type('#SearchTicket', sinistroInput);
        await page.waitForSelector("#ActionFiltrar");
        await page.click('#ActionFiltrar', "middle");
        await page.waitForTimeout(3500);
        //Pular sinistros 
        let checkChamado = await page.$("body > table:nth-child(8) > tbody > tr > td > table > tbody > tr.list-title-1 > td > table > tbody > tr > td.list-title-right");
        let linha = await page.$('body > table:nth-child(8) > tbody > tr > td > table > tbody > tr:nth-child(3) > td:nth-child(8)');
        if(linha != null )
            linha = await page.evaluate(el => el.textContent, linha);
            console.log(linha)
        checkChamado = await page.evaluate(el => el.textContent, checkChamado);
        console.log(checkChamado)

        await page.waitForTimeout(2000);
        if(checkChamado !== "( 0/0 )"){
        await page.waitForSelector("body > table:nth-child(8) > tbody > tr > td > table > tbody > tr:nth-child(3) > td:nth-child(1) > a"); 
        await page.click("body > table:nth-child(8) > tbody > tr > td > table > tbody > tr:nth-child(3) > td:nth-child(1) > a");
        }
        else{
            i++;
            this.listagem(page, dadosTerminal, arr, i)
            return;
        }

        //Linha Moveis Ou Demais
        var linhaid;
        switch (arr[i].Linha) {
            case 'MOVEIS':
                linhaid = 2;
            break;
        
            case 'DEMAIS':
                linhaid = 88;
            break;

            case 'MARROM':
                linhaid = 108;
            break;
            case 'BRANCA':
                linhaid = 109;
            break;
            default:
                break;
        }
                                    
        await page.waitForSelector('body > table:nth-child(29) > tbody > tr:nth-child(1) > td > table > tbody > tr.list-title-1 > td');
        let sinistro = await page.$('body > table:nth-child(29) > tbody > tr:nth-child(1) > td > table > tbody > tr.list-title-1 > td');
        let cliente = await page.$('body > table:nth-child(29) > tbody > tr:nth-child(1) > td > fieldset:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(2)');
        let cpf = await page.$('body > table:nth-child(29) > tbody > tr:nth-child(1) > td > fieldset:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(4)');
        let endereco = await page.$('body > table:nth-child(29) > tbody > tr:nth-child(1) > td > fieldset:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(2)');
        let telefone = await page.$('body > table:nth-child(29) > tbody > tr:nth-child(1) > td > fieldset:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(4)');
        let cidadeCep = await page.$('body > table:nth-child(29) > tbody > tr:nth-child(1) > td > fieldset:nth-child(2) > table > tbody > tr:nth-child(3) > td:nth-child(2)');
        let estado = await page.$('body > table:nth-child(29) > tbody > tr:nth-child(1) > td > fieldset:nth-child(2) > table > tbody > tr:nth-child(4) > td:nth-child(2)');
        let email = await page.$('body > table:nth-child(29) > tbody > tr:nth-child(1) > td > fieldset:nth-child(2) > table > tbody > tr:nth-child(5) > td:nth-child(2)');
        await page.waitForTimeout(1000);
        let ramo = await page.$('#lblRamo');
        let produtoContrato = await page.$('body > table:nth-child(29) > tbody > tr:nth-child(1) > td > fieldset:nth-child(7) > table > tbody > tr:nth-child(2) > td:nth-child(2)');
        let certificado = await page.$('body > table:nth-child(29) > tbody > tr:nth-child(1) > td > fieldset:nth-child(7) > table > tbody > tr:nth-child(1) > td:nth-child(4)');
        let codigProd =  await page.$('body > table:nth-child(29) > tbody > tr:nth-child(1) > td > fieldset:nth-child(7) > table > tbody > tr:nth-child(3) > td:nth-child(2)');
        let marca =  await page.$('body > table:nth-child(29) > tbody > tr:nth-child(1) > td > fieldset:nth-child(7) > table > tbody > tr:nth-child(2) > td:nth-child(4)');
        let estadoProd =  await page.$('body > table:nth-child(29) > tbody > tr:nth-child(1) > td > fieldset:nth-child(7) > table > tbody > tr:nth-child(4) > td:nth-child(2)');
        let filialVenda =  await page.$('body > table:nth-child(29) > tbody > tr:nth-child(1) > td > fieldset:nth-child(7) > table > tbody > tr:nth-child(3) > td:nth-child(4)');
        let reincidencia = await page.$('body > table:nth-child(29) > tbody > tr:nth-child(1) > td > fieldset:nth-child(7) > table > tbody > tr:nth-child(5) > td:nth-child(2)');
        let abertSinistro = await page.$('body > table:nth-child(29) > tbody > tr:nth-child(1) > td > fieldset:nth-child(7) > table > tbody > tr:nth-child(6) > td:nth-child(2)');

        dados[iDados] = {
            Sinistro: await page.evaluate(el => el.textContent, sinistro),
            Cliente: await page.evaluate(el => el.textContent, cliente),
            Endereco: await page.evaluate(el => el.textContent, endereco),
            cidadeCep: await page.evaluate(el => el.textContent, cidadeCep),
            CPF: await page.evaluate(el => el.textContent, cpf),
            Celular: await page.evaluate(el => el.textContent, telefone),
            Estado: await page.evaluate(el => el.textContent, estado),
            Email: await page.evaluate(el => el.textContent, email),
            Ramo: await page.evaluate(el => el.textContent, ramo),
            ProdutoContrato: await page.evaluate(el => el.textContent, produtoContrato),
            Certificado: await page.evaluate(el => el.textContent, certificado),
            CodigoProduto: await page.evaluate(el => el.textContent,codigProd),
            Marca: await page.evaluate(el => el.textContent, marca),
            EstadoProduto: await page.evaluate(el => el.textContent, estadoProd),
            FilialVenda: await page.evaluate(el => el.textContent, filialVenda),
            Reincidencia: await page.evaluate(el => el.textContent, reincidencia),
            AberturaSinistro: await page.evaluate(el => el.textContent, abertSinistro),
            Sistema: dadosTerminal.obj.sistema_id[dadosTerminal.linhaT],
            Empresa: "LuizaSeg",
            IdEmpresa: linhaid,
            tipo: "os"
        };
        cidadeCep
        dados[iDados].Sinistro = dados[iDados].Sinistro.toString().replace("Número do Chamado: \n\t\t\t\t\t\t\t\t", "");
        dados[iDados].CPF = dados[iDados].CPF.toString().replaceAll(" ", "");
        dados[iDados].Celular = dados[iDados].Celular.toString().replaceAll(" ", "");
        // dados[iDados].cidadeCep = dados[iDados].cidadeCep.toString().replaceAll("-", "");
        // dados[iDados].cidadeCep = dados[iDados].cidadeCep.toString().replaceAll(" ", "");

        dados[iDados].Sinistro = dados[iDados].Sinistro.toString().replace("\n\t\t\t\t\t\t\t", "");
        dados[iDados].Sinistro = dados[iDados].Sinistro.toString().replace("T", "");
        dados[iDados].ProdutoContrato = dados[iDados].ProdutoContrato.toString().replace(/[^-]*$/g, '');
        // dados[iDados].Reclamacoes = dados[iDados].Reclamacoes.toString().replace(/[\n\t]/g,'');
        // dados[iDados].produto = dados[iDados].produto.toString().replace(/\\/g,'');
        dados[iDados].ProdutoContrato = dados[iDados].ProdutoContrato.toString().replace(" -", "");
        iDados++
        console.log(dados);
        i++;
        await page.waitForSelector("#btnhome");
        await page.click('#btnhome');
        if(i < 350){
            this.listagem(page, dadosTerminal, arr, i)
            fs.writeFileSync('./LuizaSeg/LuizaDados.json', JSON.stringify(dados).trim());
        } 
    } catch(e){
            console.log(e)
            this.enviaOs()
            return;
        }
}
async enviaOs(){
    console.log("enviou os dados");

    var content = JSON.parse(fs.readFileSync("./LuizaSeg/LuizaDados.json"));
    await this.loopEnvia(content);
}

async loopEnvia(content, i = 0, tentativas = 1) {
        await axios.post('https://gsplanaltec.com/GerenciamentoServicos/APIControle/Importacao', [ content[i] ], {
            headers:{
                    'Content-Type' : 'application/json; charset=UTF-8',
            }
        })
        .then(function (response) {
            // response = JSON.parse(response);
            console.log(response);
        })
        .catch(function (error) {
            console.error(error);
        });

        tentativas = 1;
        i++;
    
        if (i <= content.length - 1)
          await this.loopEnvia(content, browser, i, tentativas);
        else {
          console.log("Finalizou tudo!");
          return;
        }
}
}