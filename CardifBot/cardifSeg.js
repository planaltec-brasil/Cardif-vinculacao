const puppeteer = require('puppeteer');
var fs = require('fs');
const xlsx = require('xlsx')
var iDados = 0;
var axios = require ('axios');
const { exit } = require('process');
var dados = [];
var validados = [];
var adicionar = [];
const workbook = xlsx.readFile('./comunicado.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
var posts = [];

module.exports = class cardifSeg {
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
        })
        // .catch(function (error) {
        //     console.error('');
        // });
        return ip;
    }

    
    async iniciaCardif(website, dadosTerminal){
        for(let i = 0; i < 140; i++){ 
            const wb = xlsx.readFile("comunicado.xlsx");
            const ws = wb.Sheets[wb.SheetNames[0]];
            let data = xlsx.utils.sheet_to_json(ws);
            let {SINISTRO, LINHA} = data[i];
            let objNovo = {
                Sinistro: SINISTRO,
                Linha: LINHA
            }
            validados.push(objNovo)
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

            const browser = await puppeteer.launch({headless: false});
            const page = await browser.newPage();
                await page.waitForTimeout(15000) 
                console.log('Finalizou');
                console.log(adicionar);           
            if(adicionar.length == 0) {
                console.log("Sem registros novos!")
                return;
            }
            await page.goto(website);
            console.log('CARDIFFF')
            await page.type('#usr_login', 'assistU14727')
            await page.waitForTimeout(2000)
            await page.type('#usr_password', 'G4aranti@')
            await page.waitForTimeout(2000)
            await page.click('input[name=new_login]');
            
            await page.waitForTimeout(5000);
            // await page.click("body > div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-front.ui-draggable.ui-resizable > div.ui-dialog-titlebar.ui-widget-header.ui-corner-all.ui-helper-clearfix.ui-draggable-handle > button");
            
            this.listagem(page, dadosTerminal, adicionar, 0);
            
    }
    
    async verifica(validados) {
        for (const e of validados) {
            if (e.Sinistro != undefined) {
                let verificacao = await this.verificaSinistro(e);
                if (verificacao.length == 0) {
                    adicionar.push(e);
                    console.log(e);
                }
            }
        }
        console.log(adicionar);
    }
    async listagem(page, dadosTerminal, arr, i) {
        try{
        console.log(arr[i].Sinistro);
        //MEU CODIGO AQUI
        await page.waitForTimeout(4000);
        let sinistroInput = arr[i].Sinistro.toString()
        console.log(sinistroInput);
        await page.waitForTimeout(3500);
        await page.type('#SearchTicket', sinistroInput);
        await page.waitForTimeout(3500);
        await page.waitForSelector("#ActionFiltrar");
        await page.click('#ActionFiltrar', "middle");
        await page.waitForTimeout(4000);
        //Pular sinistros 
        let checkChamado = await page.$("body > table:nth-child(8) > tbody > tr > td > table > tbody > tr.list-title-1 > td > table > tbody > tr > td.list-title-right")
        let linha = await page.$('body > table:nth-child(8) > tbody > tr > td > table > tbody > tr:nth-child(3) > td:nth-child(8)');
        if(linha != null )
        linha = await page.evaluate(el => el.textContent, linha);

        await page.waitForTimeout(4000);
        checkChamado = await page.evaluate(el => el.textContent, checkChamado);
        console.log(checkChamado)
        //Pular Sinistro que não existe
        await page.waitForTimeout(2000);
        if(checkChamado !== "( 0/0 )"){
        console.log('deu certo')
        await page.waitForSelector("body > table:nth-child(8) > tbody > tr > td > table > tbody > tr:nth-child(3) > td:nth-child(1) > a"); 
        await page.click("body > table:nth-child(8) > tbody > tr > td > table > tbody > tr:nth-child(3) > td:nth-child(1) > a");
        }else{
            i++;
            await this.listagem(page, dadosTerminal, arr, i)
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

        await page.waitForTimeout(4000);
        let sinistro = await page.$('body > table:nth-child(30) > tbody > tr:nth-child(1) > td > table > tbody > tr.list-title-1 > td');
        let cliente = await page.$('body > table:nth-child(30) > tbody > tr:nth-child(1) > td > fieldset:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(2)');
        let cpf = await page.$('body > table:nth-child(30) > tbody > tr:nth-child(1) > td > fieldset:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(4)');
        let endereco = await page.$('body > table:nth-child(30) > tbody > tr:nth-child(1) > td > fieldset:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(2)');
        let telefone = await page.$('body > table:nth-child(30) > tbody > tr:nth-child(1) > td > fieldset:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(4)');
        let cidadeCep = await page.$('body > table:nth-child(30) > tbody > tr:nth-child(1) > td > fieldset:nth-child(2) > table > tbody > tr:nth-child(3) > td:nth-child(2)');
        let estado = await page.$('body > table:nth-child(30) > tbody > tr:nth-child(1) > td > fieldset:nth-child(2) > table > tbody > tr:nth-child(4) > td:nth-child(2)');
        let email = await page.$('body > table:nth-child(30) > tbody > tr:nth-child(1) > td > fieldset:nth-child(2) > table > tbody > tr:nth-child(5) > td:nth-child(2)');
        let ramo = await page.$('body > table:nth-child(30) > tbody > tr:nth-child(1) > td > fieldset:nth-child(7) > table > tbody > tr:nth-child(1) > td:nth-child(2)');
        let produtoContrato = await page.$('body > table:nth-child(30) > tbody > tr:nth-child(1) > td > fieldset:nth-child(7) > table > tbody > tr:nth-child(2) > td:nth-child(2)');
        let certificado = await page.$('body > table:nth-child(30) > tbody > tr:nth-child(1) > td > fieldset:nth-child(7) > table > tbody > tr:nth-child(1) > td:nth-child(4)');
        let codigProd =  await page.$('body > table:nth-child(30) > tbody > tr:nth-child(1) > td > fieldset:nth-child(7) > table > tbody > tr:nth-child(3) > td:nth-child(2)');
        let marca =  await page.$('body > table:nth-child(30) > tbody > tr:nth-child(1) > td > fieldset:nth-child(7) > table > tbody > tr:nth-child(2) > td:nth-child(4)');
        let estadoProd =  await page.$('body > table:nth-child(30) > tbody > tr:nth-child(1) > td > fieldset:nth-child(7) > table > tbody > tr:nth-child(4) > td:nth-child(2)');
        let filialVenda =  await page.$('body > table:nth-child(30) > tbody > tr:nth-child(1) > td > fieldset:nth-child(7) > table > tbody > tr:nth-child(3) > td:nth-child(4)');
        let reincidencia = await page.$('body > table:nth-child(30) > tbody > tr:nth-child(1) > td > fieldset:nth-child(7) > table > tbody > tr:nth-child(5) > td:nth-child(2)');
        let abertSinistro = await page.$('body > table:nth-child(30) > tbody > tr:nth-child(1) > td > fieldset:nth-child(7) > table > tbody > tr:nth-child(6) > td:nth-child(2)');
        await page.waitForTimeout(3500);
        console.log("Leitura de todos os sinistros realizada.")
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
            Empresa: "CardifSeg",
            Sistema: dadosTerminal.obj.sistema_id[dadosTerminal.linhaT],
            IdEmpresa: linhaid,
            tipo : "os"
        };
        dados[iDados].Sinistro = dados[iDados].Sinistro.toString().replace("Número do Chamado: \n\t\t\t\t\t\t\t\t", "");
        dados[iDados].Endereco = dados[iDados].Endereco.normalize('NFD').toString().replace(/[\u0300-\u036f]/g, "");
        dados[iDados].Sinistro = dados[iDados].Sinistro.toString().replace("\n\t\t\t\t\t\t\t", "");
        dados[iDados].Sinistro = dados[iDados].Sinistro.toString().replace("T", "");
        dados[iDados].ProdutoContrato = dados[iDados].ProdutoContrato.toString().replace(/[^-]*$/g, '');
        // dados[iDados].Reclamacoes = dados[iDados].Reclamacoes.toString().replace(/[\n\t]/g,'');
        // dados[iDados].produto = dados[iDados].produto.toString().replace(/\\/g,'');
        dados[iDados].ProdutoContrato = dados[iDados].ProdutoContrato.toString().replace(" -", "");
        iDados++
        // dados[iDados] = dados[iDados].normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        console.log(dados)
        await page.waitForTimeout(2000)
        await page.click('#btnhome');
        await page.waitForTimeout(4000)
        i++;
        if(i < 350){ 
            await this.listagem(page, dadosTerminal, arr, i)
            fs.writeFileSync('./CardifBot/cardiffDados.json', JSON.stringify(dados).trim())
        }
        }catch(e){
            console.log(e)
            await this.enviaOs()
            return;
            
        }}  

        sleep(ms) {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        }
        fechaNavegador(){
            browser.close();
        }
        
        async enviaOs(){
            console.log("enviou os dados")

            var content =  JSON.parse(fs.readFileSync("./CardifBot/cardiffDados.json"));
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
              await this.loopEnvia(content, i, tentativas);
            else {
              console.log("Finalizou tudo!");
              return;
            }
    }
}