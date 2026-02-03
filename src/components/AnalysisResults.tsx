import { CheckCircle2, TrendingUp, Droplets, Sun, AlertCircle, Info } from 'lucide-react';
import { SkinAnalysisResult, concernLabels, metricLabels } from '../lib/skinAnalysis';
import FaceMeshOverlay from './FaceMeshOverlay';

interface AnalysisResultsProps {
  result: SkinAnalysisResult;
  imageData: string;
}

export default function AnalysisResults({ result, imageData }: AnalysisResultsProps) {
  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score < 30) return 'bg-green-500';
    if (score < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score < 20) return 'Excellent';
    if (score < 40) return 'Good';
    if (score < 60) return 'Fair';
    if (score < 80) return 'Needs Attention';
    return 'Requires Care';
  };

  const skinTypeIcons: Record<string, typeof Droplets> = {
    dry: Droplets,
    oily: Sun,
    combination: TrendingUp,
    normal: CheckCircle2,
    sensitive: AlertCircle
  };

  const SkinIcon = skinTypeIcons[result.skinType] || CheckCircle2;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-full mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <span className="text-sm font-medium text-emerald-900">Analysis Complete</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Your Comprehensive Skin Analysis</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            AI-powered dermatologist-level analysis of your skin across 15 key metrics
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <FaceMeshOverlay
              imageData={imageData}
              className="w-full aspect-square mb-4"
            />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Confidence Score</p>
                <p className="text-2xl font-bold text-emerald-600">{result.confidence}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Skin Type</p>
                <div className="flex items-center gap-2 justify-end">
                  <SkinIcon className="w-5 h-5 text-emerald-600" />
                  <p className="text-2xl font-bold text-gray-900 capitalize">{result.skinType}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Primary Skin Concerns</h3>
              <div className="flex flex-wrap gap-2">
                {result.concerns.map((concern) => (
                  <span
                    key={concern}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-900 rounded-full text-sm font-medium border border-emerald-200"
                  >
                    {concernLabels[concern] || concern}
                  </span>
                ))}
              </div>
            </div>

            {result.detailedAnalysis && (
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Professional Analysis</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{result.detailedAnalysis}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100 mb-8">
  <h3 className="text-2xl font-bold text-gray-900 mb-6">Detailed Skin Metrics</h3>
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Object.entries(result.details)
      .filter(([key]) => !['skinType', 'recommendations', 'detailedAnalysis'].includes(key))
      .map(([key, value]) => (
        <div key={key} className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-900">
              {metricLabels[key as keyof typeof metricLabels] || key}
            </span>
            <span className={`text-sm font-bold ${getScoreColor(value)}`}>
              {getScoreLabel(value)}
            </span>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 ${getScoreBg(value)} transition-all duration-1000 rounded-full`}
              style={{ width: `${value}%` }}
            />
          </div>
          <div className="mt-2 text-right">
            <span className="text-xs font-medium text-gray-600">{Math.round(value)}/100</span>
          </div>
        </div>
      ))}
  </div>
</div>

        {result.recommendations && (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 sm:p-8 shadow-lg border border-emerald-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Personalized Recommendations</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{result.recommendations}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
