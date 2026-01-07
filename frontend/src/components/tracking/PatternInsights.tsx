import { useState, useEffect } from "react";
import { analysisService, type CorrelationResult } from "@/services/analysisService";
import { Card } from "@/components/common/Card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { 
    SparklesIcon, 
    ArrowTrendingUpIcon, 
    ArrowTrendingDownIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon
} from "@heroicons/react/24/outline";

export const PatternInsights = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{
        correlations: CorrelationResult[];
        aiInsights: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true);
                const result = await analysisService.getPatterns();
                setData(result);
            } catch (err: any) {
                setError("Failed to load health insights. Please ensure you have enough logged data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, []);

    if (loading) return (
        <div className="flex justify-center p-12">
            <LoadingSpinner size="lg" />
        </div>
    );

    if (error) return (
        <div className="p-4 bg-amber-50 text-amber-700 rounded-lg border border-amber-100 flex items-center gap-3">
            <InformationCircleIcon className="w-5 h-5" />
            <p className="text-sm">{error}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Insights Section */}
                <Card 
                    title="AI Health Insights" 
                    description="Powered by Mistral-7B"
                    className="h-full border-primary-100 bg-primary-50/30"
                >
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary-100 rounded-lg shrink-0">
                            <SparklesIcon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="prose prose-sm text-gray-700 whitespace-pre-line leading-relaxed">
                            {data?.aiInsights}
                        </div>
                    </div>
                </Card>

                {/* Statistical Correlations Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">
                        Statistical Correlations
                    </h3>
                    {data?.correlations.length === 0 ? (
                        <div className="p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                            <p className="text-sm text-gray-500">
                                Not enough data yet to identify strong correlations. 
                                Keep logging your daily activities!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data?.correlations.map((corr, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
                                    <div className={`p-2 rounded-lg shrink-0 ${
                                        corr.type === 'trigger' ? 'bg-amber-50' : 
                                        (corr.score && corr.score > 0 ? 'bg-red-50' : 'bg-emerald-50')
                                    }`}>
                                        {corr.type === 'trigger' ? (
                                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
                                        ) : (
                                            corr.score && corr.score > 0 ? (
                                                <ArrowTrendingUpIcon className="w-5 h-5 text-red-600" />
                                            ) : (
                                                <ArrowTrendingDownIcon className="w-5 h-5 text-emerald-600" />
                                            )
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-gray-900">{corr.factor}</p>
                                            {corr.score !== undefined && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                    Math.abs(corr.score) > 0.6 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    Score: {corr.score}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{corr.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
