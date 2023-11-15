import { PdfData, PdfObjects } from '../screens/Mainscreen';


export const handleSortByDate = (PdfObjects: PdfObjects, setPdfObjects: React.Dispatch<React.SetStateAction<PdfObjects>>) => {
    // Sort pdfObjects by date in ascending order
    const sortedPdfObjects = [...PdfObjects].sort((a, b) => {
        // Assuming date is in ISO format
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
    });

    setPdfObjects(sortedPdfObjects);
};

export const handleSortByRelevance = (PdfObjects: PdfObjects, setPdfObjects: React.Dispatch<React.SetStateAction<PdfObjects>>) => {
    // Sort pdfObjects by relevance in ascending order
    const sortedPdfObjects = [...PdfObjects].sort((a, b) => {
        return a.relevance - b.relevance;
    });

    setPdfObjects(sortedPdfObjects);
};