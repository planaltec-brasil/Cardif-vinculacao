
const cardifSeg = require('./CardifBot/cardifSeg.js');
const luizaseg = require('./LuizaSeg/luizaseg.js');
var fs = require('fs');
//Chama Modulos
var  assuranteRomaneios = ''
var assuranteOs =  ''
var cardif = new cardifSeg();
var luiza = new luizaseg();
var assurantOrc = ''
var assinaSeg = ''
var romaneios = ''

var config = JSON.parse(fs.readFileSync("./config.json"));

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.clear();

rl.question('Escolha a Serguradora: (Digite o Codigo) \n Assurant - 0 \n Cardif - 1 \n LuizaSeg - 2 \n', function (seguradora) {
    rl.question(`Ecolha a Linha: (Digite o Codigo) \n ${config[seguradora].linhas} \n`, function (linha) {
        rl.question(`Escolha a Opção: (Digite o Codigo) \n ${config[seguradora].opcoes} \n`, function (opcao) {
            console.log(`${config[seguradora].seguradora} automação foi iniciada na ${config[seguradora].linhas[linha]}`);
            selecionaAutomacao(seguradora, linha, opcao, config[seguradora]);
        });
    });
});

function selecionaAutomacao(seguradora, linha, opcao, objSegurado){ 

    var dadosTerminal = {
        seguradoraT: seguradora,
        linhaT: linha,
        opcaoT: opcao,
        obj: objSegurado
    }

    if(seguradora == 0){
        if(opcao == 0){
            console.log('importando dados...');
            assuranteOs.iniciaNavegadorBot("https://www.assurantclaims.com.br/", dadosTerminal);
        }if (opcao == 1){
            console.log('importando dados...');
            romaneios.romaneio("https://www.assurantclaims.com.br/", dadosTerminal);
            }
            
        if(opcao == 2){
            console.log('importando Orçamentos');
            assurantOrc.iniciaNavegadorBot("https://www.assurantclaims.com.br/", dadosTerminal);
        }if(opcao == 3){
            console.log('Inicio Processo');
            assinaSeg.iniciaNavegadorBot("https://www.assurantclaims.com.br/", dadosTerminal)};
    }

    if(seguradora == 1){
        console.log('importando dados...');
        cardif.iniciaCardif("https://egarantia.cardif.com.br/Login.asp", dadosTerminal);
    }

    if(seguradora == 2){
        console.log('importando dados...');
        luiza.iniciaLuiza("https://www.luizaseg.com.br/egarantia/HomeServTecnico.asp", dadosTerminal);
    }
}

rl.on('close', function () {
    process.exit(0);
});
