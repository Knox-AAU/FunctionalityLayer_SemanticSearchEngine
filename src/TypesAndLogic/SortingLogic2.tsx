import { PdfData } from '../TypesAndLogic/Types';





/** Sorts an array of PDF objects by date.
 * {PdfData[]} pdfObjects - The array of PDF objects to be sorted.
 * {'ascending' | 'descending'} sortOrder - The order in which to sort the objects.
 * returns {PdfData[]} - The sorted array of PDF objects. */

export const sortPdfObjectsByDate = (
  pdfObjects: PdfData[],
  sortOrder: 'ascending' | 'descending'
) => {
  // Create a shallow copy of the original array to avoid modifying the original array
  return [...pdfObjects].sort((a, b) => {
    // Convert the date strings to Date objects
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    // Calculate the difference in milliseconds between the two dates
    const result = dateA.getTime() - dateB.getTime();

    // Return the result based on the specified sortOrder
    return sortOrder === 'ascending' ? result : -result;
  });
};


/** Sorts an array of PDF objects by relevance.
 * {PdfData[]} pdfObjects - The array of PDF objects to be sorted.
 * returns {PdfData[]} - The sorted array of PDF objects. */
export const sortPdfObjectsByRelevance = (pdfObjects: PdfData[]) => {
  // Create a shallow copy of the original array to avoid modifying the original array
  return [...pdfObjects].sort((a, b) => a.relevance - b.relevance);
};
