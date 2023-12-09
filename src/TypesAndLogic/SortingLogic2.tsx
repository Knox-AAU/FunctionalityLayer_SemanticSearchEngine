import { pdfObjectArray } from '../TypesAndLogic/Types';
import { pdfObject } from '../TypesAndLogic/Types';


export const sortPdfObjectsByDate = (pdfObjectArray: pdfObject[], sortOrder: 'ascending' | 'descending') => {
  return [...pdfObjectArray].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    const result = dateA.getTime() - dateB.getTime();
    return sortOrder === 'ascending' ? result : -result;
  });
};

export const sortPdfObjectsByRelevance = (pdfObjectArray: pdfObject[]) => {
  return pdfObjectArray.sort((a, b) => a.relevance - b.relevance);
};