import { PdfData } from '../TypesAndLogic/Types';

export const sortPdfObjectsByDate = (
  pdfObjects: PdfData[],
  sortOrder: 'ascending' | 'descending'
) => {
  return [...pdfObjects].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    const result = dateA.getTime() - dateB.getTime();
    return sortOrder === 'ascending' ? result : -result;
  });
};

export const sortPdfObjectsByRelevance = (pdfObjects: PdfData[]) => {
  return [...pdfObjects].sort((a, b) => a.relevance - b.relevance);
};