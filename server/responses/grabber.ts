import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import { getPostData } from '../serverHelpers';
import { IncomingMessage as Request, ServerResponse as Response } from 'http';
import { errorResponse } from '../responseHandlers';
import { JSDOM } from 'jsdom';
import { dirname } from 'path';
import { Client } from 'pg';

const rootPath = dirname(require.main?.filename!);
const pdfDir = rootPath + "/texts/pdfs/";
const stringDir = rootPath + "/texts/strings/"
console.log(pdfDir);
let _isConnected = false;

//Check docker folder
const client = new Client({
  user: 'defaultuser',
  host: 'postgres',
  database: 'semanticDB',
  password: '1234',
  port: 5432,
});

type queryType = {
  query: string,
}

type dbEntry = {
  stringPath: string,
  title: string,
  pdfPath: string,
  url: string
}

// res: response handles errors
export const GrabButDataFirst = (req: Request, res: Response) => {
  return getPostData(req)
    .then((data) => {
      return insertIntoDB(GrabWiki((data as queryType).query), req, res);
    })
    .catch((err) => {
      return errorResponse(res, 500, "Couldn't get postdata:" + err);
    })
}

// res: response handles errors
const insertIntoDB = async (entryPromise: Promise<dbEntry>, req: Request, res: Response) => {
  const entry = await entryPromise;
  await ensureConnected(client);

  const insertQuery = 'INSERT INTO pdfTable(title, url, pdfPath, stringPath, author, timestamp) VALUES ($1, $2, $3, $4, $5, $6)';
  const values = [entry.title, entry.url, entry.pdfPath, entry.stringPath, "N/A", Date.now().toString().split('T')[0]];
  try {
    await client.query(insertQuery, values)

    res.writeHead(200, {});
    res.end("\n");

    return 0;
  } catch (err) {
    return errorResponse(res, 500, "PG: " + err.toString());
  }

}

export const ensureConnected = async (client: Client): Promise<void> => {
  if (!_isConnected) {
    await client.connect();
    _isConnected = true;
  }
  return Promise.resolve();
}

const GrabWiki = async (url: string): Promise<dbEntry> => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'], });
  const page = await browser.newPage();

  try {
    // Navigate to the website
    await page.goto(url);

    const htmlContent = new JSDOM(await page.content()).window._document;

    const title = (await page.title()).slice(0, -11).trim();

    mkdir(pdfDir);
    mkdir(stringDir);
    const pdfPath = `${pdfDir}${title}.pdf`
    const stringPath = `${stringDir}${title}.txt`;
    await page.pdf({ path: pdfPath })
    await browser.close();
    fs.writeFileSync(stringPath, exploreHTMLElement(htmlContent.querySelector('div.mw-content-ltr') as HTMLElement));
    return {
      stringPath: stringPath,
      title: title,
      pdfPath: pdfPath,
      url: url
    }
  } catch (error) {
    console.error('Error:', error);
    return error;
  }
};

const exploreHTMLElement = (element: HTMLElement) => {
  let content = "";
  let skipChildren = false;

  //console.log("NodeType");
  //console.log(element.nodeType + element.nodeName);
  if (element.nodeName == "#text") {
    content += " " + element.textContent?.trim();
    skipChildren = true;
  }
  if (element.nodeName == "A") {
    content += " " + element.title;
    skipChildren = false;
  }

  if (!skipChildren && element.hasChildNodes()) {
    [...element.childNodes].forEach((child) => {
      if (element.nodeName != 'STYLE') {
        content += exploreHTMLElement(child as HTMLElement);
      }
    })
  }

  return content;
}

const mkdir = (path: string) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
}