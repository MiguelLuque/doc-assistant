'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Send, Upload, Book, MessageSquare } from "lucide-react"
import { Document, Page, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PDFViewerProps {
  pdfUrl: string;
  highlight?: string;
  onLoad: () => void;
  currentPage: number;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, highlight, onLoad, currentPage }) => {
  const [numPages, setNumPages] = useState<number | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    onLoad();
  }

  return (
    <div className="bg-gray-100 bg-opacity-50 p-4 rounded-lg h-full overflow-auto shadow-inner">
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<p>Cargando PDF...</p>}
        error={<p>Error al cargar el PDF. Por favor, inténtalo de nuevo.</p>}
      >
        <Page
          pageNumber={currentPage}
          renderTextLayer={true}
          renderAnnotationLayer={true}
        />
      </Document>
      {highlight && (
        <div className="mt-4 p-2 bg-yellow-100 bg-opacity-50 rounded border border-yellow-200">
          <p className="text-gray-800">Texto resaltado: {highlight}</p>
        </div>
      )}
    </div>
  )
}

interface ChatResponse {
  text: string;
  reference: string;
  page: number;
}

interface ChatItem {
  question: string;
  responses: ChatResponse[];
}

export default function MinimalistPDFViewerChat() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);
  const [highlightedText, setHighlightedText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileUrl = URL.createObjectURL(file);
      setPdfUrl(fileUrl);
    }
  }

  const handleQuestionSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Simula una respuesta del servidor
    const newResponses: ChatResponse[] = [
      { text: "Este párrafo del documento responde a tu pregunta.", reference: "Página 2, párrafo 1", page: 2 },
      { text: "Aquí hay información adicional del texto.", reference: "Página 4, párrafo 3", page: 4 },
      { text: "Esta es otra respuesta relevante.", reference: "Página 1, párrafo 2", page: 1 }
    ];
    setChatHistory([...chatHistory, { question, responses: newResponses }]);
    setQuestion('');
  }

  const handleReferenceClick = (response: ChatResponse) => {
    setHighlightedText(response.text);
    setCurrentPage(response.page);
  }

  const handlePDFLoad = () => {
    console.log("PDF cargado y listo para visualizar");
  }

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Visualizador PDF y Chat</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
        <Card className="h-full bg-white bg-opacity-20 backdrop-blur-sm border-gray-200">
          <CardHeader className="border-b border-gray-200 bg-white bg-opacity-30">
            <CardTitle className="text-gray-800 flex items-center">
              <Book className="mr-2" />
              Visualizador de Documento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-4rem)]">
            {!pdfUrl ? (
              <div className="flex items-center justify-center h-full bg-gray-50 bg-opacity-50">
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <Input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <span className="text-gray-500 text-center">Haz clic para cargar un documento PDF</span>
                  </div>
                </label>
              </div>
            ) : (
              <PDFViewer
                pdfUrl={pdfUrl}
                highlight={highlightedText}
                onLoad={handlePDFLoad}
                currentPage={currentPage}
              />
            )}
          </CardContent>
        </Card>
        <Card className="h-full flex flex-col bg-white bg-opacity-20 backdrop-blur-sm border-gray-200">
          <CardHeader className="border-b border-gray-200 bg-white bg-opacity-30">
            <CardTitle className="text-gray-800 flex items-center">
              <MessageSquare className="mr-2" />
              Chat Asistente
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-4">
            <ScrollArea className="flex-grow mb-4 pr-4">
              {chatHistory.map((item, index) => (
                <div key={index} className="mb-4">
                  <p className="font-semibold text-gray-800">{item.question}</p>
                  {item.responses.map((response, respIndex) => (
                    <div key={respIndex} className="ml-4 mt-2">
                      <p className="text-gray-600">{response.text}</p>
                      <Button
                        variant="link"
                        onClick={() => handleReferenceClick(response)}
                        className="text-xs p-0 h-auto text-gray-500 hover:text-gray-700"
                      >
                        {response.reference}
                      </Button>
                    </div>
                  ))}
                </div>
              ))}
            </ScrollArea>
            <form onSubmit={handleQuestionSubmit} className="flex items-center space-x-2">
              <Input
                placeholder="Haz una pregunta sobre el documento..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-grow bg-white bg-opacity-50 border-gray-300"
              />
              <Button type="submit" disabled={!pdfUrl} className="bg-gray-700 hover:bg-gray-600">
                <Send className="h-4 w-4" />
                <span className="sr-only">Enviar pregunta</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}