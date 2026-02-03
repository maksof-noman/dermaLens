import { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Products from './pages/Products';
import About from './pages/About';
import LiveCameraWithDetection from './components/LiveCameraWithDetection';
import LiveProcessing from './components/LiveProcessing';
import MobileResultsPage from './components/MobileResultsPage';
import MobileOnlyWarning from './components/MobileOnlyWarning';
import AnalysisResults from './components/AnalysisResults';
import ProductRecommendations from './components/ProductRecommendations';
import Footer from './components/Footer';
import { SkinAnalysisResult } from './lib/skinAnalysis';
import { Loader2, AlertCircle } from 'lucide-react';
import { isMobileDevice } from './utils/deviceDetection';
import { scanFaceApi } from "./services/scanService";
import { base64ToFile } from "./utils/base64ToFile";
 interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  image_url: string;
  price: number;
  category: string;
  skin_concerns: string[];
  rating: number;
  ingredients: string;
  created_at: string;
}

type Page = 'home' | 'how-it-works' | 'products' | 'about' | 'scan' | 'camera' | 'processing' | 'results';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [scannedImage, setScannedImage] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<SkinAnalysisResult | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>('');

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  useEffect(() => {
    const isDev = import.meta.env.DEV;
    setIsMobile(isDev ? true : isMobileDevice());
  }, []);

  const handleStartScan = () => {
    setCurrentPage('camera');
    setError('');
  };

  const handleCameraCapture = (imageData: string) => {
    console.log('Camera captured image:', imageData ? `${imageData.substring(0, 50)}...` : 'NO IMAGE');
    setScannedImage(imageData);
    setCurrentPage('processing');
    handleScanComplete(imageData);
  };

  const handleProcessingComplete = () => {
    console.log('Processing complete, switching to results. Image data:', scannedImage ? `${scannedImage.substring(0, 50)}...` : 'NO IMAGE');
    setCurrentPage('results');
  };

  const handleScanComplete = async (imageData: string) => {
  setIsAnalyzing(true);
  setError("");

  try {
    const imageFile = base64ToFile(imageData);
    const response = await scanFaceApi(imageFile, "v1");
    const recommendedProducts = response.recommendedProducts;
    console.log(response,"recommendProducts")
    if (!response.success) {
      throw new Error(response.message || "Scan failed");
    }
    const mappedResult: SkinAnalysisResult = {
      confidence: response.confidence,
      skinType: "normal",
      concerns: response.skinConcerns,
      details: response.analysis || {},
      detailedAnalysis: response.message,
      recommendations: recommendedProducts
        ?.map((p: any) => `• ${p.name}`)
        .join("\n") || ""
    };
    console.log(mappedResult,"mappedResult")

    setAnalysisResult(mappedResult);
    setScannedImage(imageData);
    setCurrentPage("results");
    setRecommendedProducts(recommendedProducts || []);

  } catch (err) {
    console.error("Scan error:", err);
    setError(err instanceof Error ? err.message : "Scan failed");
  } finally {
    setIsAnalyzing(false);
  }
};

  const handleNewScan = () => {
    setCurrentPage('home');
    setScannedImage('');
    setAnalysisResult(null);
    setRecommendedProducts([]);
    setError('');
  };

  const handleCloseScan = () => {
    setCurrentPage('home');
    setError('');
  };

  useEffect(() => {
    if (currentPage !== 'home' && currentPage !== 'camera' && currentPage !== 'processing' && currentPage !== 'results') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onStartScan={handleStartScan} />;
      case 'how-it-works':
        return <HowItWorks />;
      case 'products':
        return <Products />;
      case 'about':
        return <About />;
      case 'camera':
        return <LiveCameraWithDetection onCapture={handleCameraCapture} onClose={handleCloseScan} />;
      case 'processing':
        return <LiveProcessing
          imageData={scannedImage}
          isAnalyzing={isAnalyzing}
          onComplete={handleProcessingComplete}
        />;
      case 'results':
        return (
          <>
            {isAnalyzing ? (
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                <div className="text-center">
                  <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Skin</h2>
                  <p className="text-gray-600">Our AI dermatologist is examining your skin across 15 metrics...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take 10-15 seconds</p>
                </div>
              </div>
            ) : error ? (
              <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-white">
                <div className="max-w-md w-full bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center">
                  <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Analysis Failed</h2>
                  <p className="text-gray-700 mb-6">{error}</p>
                  <button
                    onClick={handleNewScan}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : analysisResult ? (
              <div className="md:hidden">
                <MobileResultsPage
                  imageData={scannedImage}
                  products={recommendedProducts}
                  onBack={handleNewScan}
                />
              </div>
            ) : null}
            {!isAnalyzing && !error && analysisResult && (
              <div className="hidden md:block">
                <AnalysisResults result={analysisResult} imageData={scannedImage} />
                <ProductRecommendations products={recommendedProducts} />
              </div>
            )}
          </>
        );
      default:
        return <Home onStartScan={handleStartScan} />;
    }
  };

  if (!isMobile && (currentPage === 'home' || currentPage === 'camera' || currentPage === 'processing')) {
    return <MobileOnlyWarning />;
  }

  return (
    <div className="min-h-screen bg-white">
      {currentPage !== 'home' && currentPage !== 'camera' && currentPage !== 'processing' && (
        <Header currentPage={currentPage} onNavigate={handleNavigate} onNewScan={analysisResult ? handleNewScan : undefined} />
      )}
      {renderPage()}
      {currentPage !== 'home' && currentPage !== 'camera' && currentPage !== 'processing' && currentPage !== 'results' && <Footer />}
    </div>
  );
}
