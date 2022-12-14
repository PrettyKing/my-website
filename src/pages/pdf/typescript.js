import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import './index.css'
pdfjs.GlobalWorkerOptions.workerSrc = `https://chalee-typora.oss-cn-beijing.aliyuncs.com/PDF/pdf.work.js`;


export default function TypeScriptPage() {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }
  return (
    <div>
      <Document 
        className="pdf-wrap"
        file="https://chalee-typora.oss-cn-beijing.aliyuncs.com/PDF/0987652346j2.pdf" 
        onLoadSuccess={onDocumentLoadSuccess}
      >
        {
          new Array(numPages).fill(0).map((_item, index) => {
            return <Page key={index} pageNumber={index + 1} />
          })
        }
      </Document>
    </div>
  );
}
