import { Client } from "pg";
import { IncomingMessage as Request, ServerResponse as Response } from 'http';
import { determineMimeType, getPostData } from "../serverHelpers";
import { errorResponse } from "../responseHandlers";
import { ensureConnected } from "./grabber";

type spoQuery = {
  query: string,
  type: string
}

// res: response handles errors
export function spoQuery(req: Request, res: Response) {
  getPostData(req).then(async (dataTemp) => {
    const data = dataTemp as spoQuery
    const client = new Client({
      user: 'defaultUser',
      host: 'postgres', // or the address where your PostgreSQL server is running
      database: 'SPODB',
      password: '',
      port: 5432, // the default PostgreSQL port
    });
    await ensureConnected(client);
    client.query(`SELECT * FROM spoTable WHERE ${data.type.toUpperCase()} ILIKE '%${data.query}%'`, (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        return errorResponse(res, 500, err.message);
      } else {
        console.log('Query result:', result.rows);
        res.statusCode = 200;
        res.setHeader('Content-Type', determineMimeType(".json"));
        res.write(JSON.stringify(result.rows));
        res.end("\n");
        return 0;
      }
    });
  })
    .catch((err) => {
      console.log(err);
      return errorResponse(res, 500, err);
    })
}