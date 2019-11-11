const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

let contator = 0;
let dados = {};


async function gravarDados(dados, nomearquivo) {
    const json = JSON.stringify(dados, null, 4);
    let caminho = path.resolve('data', `${nomearquivo}.json`)
    try {
        await fs.writeFile(caminho, json);

    } catch (error) {
        console.log(error);
    }
    console.log('Saved data to file.');
    //console.log(dados);
}

async function lerDados(nomearquivo) {
    let dado = ''
    let caminho = path.resolve('data', `${nomearquivo}.json`)
    try {
        dado = await fs.readFile(caminho);
    } catch (error) {
        // console.log(error);
    }
    return dado;
    //console.log(dados);
}


Number.prototype.pad = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
}
const escapeXpathString = str => {
    const splitedQuotes = str.replace(/'/g, `', "'", '`);
    return `concat('${splitedQuotes}', '')`;
};

const clickByText = async (page, xpath, text) => {
    const escapedText = escapeXpathString(text);
    const xpathFinal = xpath.replace('[#textfind#]', escapedText);
    const linkHandlers = await page.$x(xpathFinal);

    if (linkHandlers.length > 0) {
        await linkHandlers[0].click();
    } else {
        throw new Error(`Link not found: ${text}`);
    }
};

async function scrappingLojas() {
    try {
        dados = await lerDados('dados');
        if (dados) {
            dados = JSON.parse(dados);
        }
        //const browser = await puppeteer.launch({ headless: false, devtools: true });
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setViewport({
            width: 1024,
            height: 900,
        });

        await page.goto(dados.site);
        await page.screenshot({ path: `screenshot${contator++}.png` ,fullPage:true});
        if (dados.contato) {
            clickByText(page, dados.contato.selector, dados.contato.texto);
        }
        await page.waitForNavigation({ waitUntil: 'load' });
        await page.waitFor(1000);
        for (let item of dados.formulario){
            await page.click(item.campo.selector);
            await page.keyboard.type(item.campo.texto, { delay: 50 });
        }
        await page.click(dados.enviar.selector);
        await page.screenshot({ path: `screenshot${contator++}.png` ,fullPage:true});
        let preenchido = { dadosenviados: dados};
        await gravarDados(preenchido, 'preenchido');
        await page.waitFor(1000);
        browser.close();

    } catch (error) {
        //
    }
}
scrappingLojas();