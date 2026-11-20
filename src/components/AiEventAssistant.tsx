import React, { useState } from 'react';
import { Sparkles, Wand2, Copy, Check, MessageSquare, Utensils, Lightbulb, Loader2 } from 'lucide-react';

interface AiEventAssistantProps {
  onApplyCardMessage?: (message: string) => void;
}

export const AiEventAssistant: React.FC<AiEventAssistantProps> = ({ onApplyCardMessage }) => {
  const [occasion, setOccasion] = useState('حفل تخرج جامعي');
  const [guestCount, setGuestCount] = useState(30);
  const [celebrantName, setCelebrantName] = useState('المهندسة سارة');
  const [tone, setTone] = useState('مبهج، فخم ومفعم بالأمل والاحتفال');
  const [preferences, setPreferences] = useState('تنوع متوازن بين الساندوتشات والكرواسون مع ميني إكلير وماكرون');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/ai/event-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion,
          guestCount,
          celebrantName,
          tone,
          preferences,
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setResult(json.data);
      }
    } catch (err) {
      console.error('Failed to get event assistant suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);

    if (onApplyCardMessage) {
      onApplyCardMessage(text);
    }
  };

  return (
    <section className="py-12 lg:py-16 bg-[#FBF8F5] border-t border-[#E8DFD8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#B46D52]">
            <Sparkles className="w-4 h-4" />
            <span>مستشار بهجة الذكي للمناسبات</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D2421]">
            نسّق ثيم مناسبتك واكتب أجمل كروت التهنئة بنقرة زر
          </h2>
          <p className="text-sm sm:text-base text-[#6B5B55]">
            شاركنا تفاصيل حفلك، وسيقترح عليك الذكاء الاصطناعي ثيم الألوان والشرائط، قائمة الضيافة المثالية، وعبارات كروت توزيعات تلامس القلوب.
          </p>
        </div>

        {/* Form and Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Input Form (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E8DFD8] shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#2D2421] pb-2 border-b border-[#F0E8E1]">
              بيانات الحفل والمناسبة
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#4F413B] block mb-1">نوع المناسبة:</label>
                <input
                  type="text"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  placeholder="مثال: حفل استقبال مولودة، خطوبة، تخرج..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CCC2] bg-[#FAF7F5] focus:border-[#B46D52] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#4F413B] block mb-1">عدد الضيوف:</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CCC2] bg-[#FAF7F5] focus:border-[#B46D52] outline-none tabular-nums"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#4F413B] block mb-1">اسم المحتفى به:</label>
                  <input
                    type="text"
                    value={celebrantName}
                    onChange={(e) => setCelebrantName(e.target.value)}
                    placeholder="الاسم المطبوع"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CCC2] bg-[#FAF7F5] focus:border-[#B46D52] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#4F413B] block mb-1">الطابع أو الثيم المفضل:</label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="مثال: ملكي كلاسيكي، ألوان باستيل ناعمة، زهري وفضي..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CCC2] bg-[#FAF7F5] focus:border-[#B46D52] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#4F413B] block mb-1">تفضيلات إضافية:</label>
                <textarea
                  rows={2}
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  placeholder="أي رغبات خاصة للأطعمة أو الحشوات..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D9CCC2] bg-[#FAF7F5] focus:border-[#B46D52] outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold text-white bg-[#B46D52] hover:bg-[#9B5A42] rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التنسيق واقتراح الأفكار...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>تنسيق المناسبة وكتابة الكروت</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Display (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {!result && !loading && (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-[#D4C3B7] text-center space-y-3">
                <Lightbulb className="w-8 h-8 text-[#B46D52] mx-auto opacity-70" />
                <h4 className="text-sm font-bold text-[#2D2421]">أفكار بهجة في انتظارك</h4>
                <p className="text-xs text-[#7D6B64] max-w-md mx-auto leading-relaxed">
                  اضغط على زر «تنسيق المناسبة وكتابة الكروت» لإنشاء مقترحات ألوان العلب، قائمة الساندوتشات والجاتوهات، و3 نصوص تهنئة مخصصة يمكنك نسخها فوراً.
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-white p-12 rounded-2xl border border-[#E8DFD8] text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#B46D52] mx-auto" />
                <div className="text-sm font-bold text-[#2D2421]">ننسّق لك أشهى المقترحات وأرق الكلمات...</div>
                <div className="text-xs text-[#82726B]">استمتع بتجربة الضيافة المترفة من بهجة</div>
              </div>
            )}

            {result && (
              <div className="bg-white p-6 rounded-2xl border border-[#E8DFD8] shadow-sm space-y-6 animate-fade-in">
                
                {/* Theme concept */}
                <div className="space-y-1 bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DFD8]">
                  <div className="text-xs font-bold text-[#B46D52] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>رؤية وتنسيق الثيم المقترح:</span>
                  </div>
                  <p className="text-xs text-[#2D2421] leading-relaxed">
                    {result.themeConcept}
                  </p>
                </div>

                {/* Suggested Menus */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 bg-[#FFFDFB] p-4 rounded-xl border border-[#F0E8E1]">
                    <div className="text-xs font-bold text-[#2D2421] flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-[#B46D52]" />
                      <span>الموالح والميني ساندوتش:</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#6B5B55]">
                      {result.savoryMenu?.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#B46D52] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 bg-[#FFFDFB] p-4 rounded-xl border border-[#F0E8E1]">
                    <div className="text-xs font-bold text-[#2D2421] flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-[#B46D52]" />
                      <span>الجاتوهات والسواريه:</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#6B5B55]">
                      {result.pastryMenu?.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#B46D52] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Messages to copy */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-[#2D2421] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#B46D52]" />
                    <span>عبارات كروت التوزيعات المقترحة (اضغط للنسخ أو الاستخدام):</span>
                  </div>

                  <div className="space-y-2">
                    {result.cardMessages?.map((msg: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl border border-[#E8DFD8] bg-[#FAF7F5] hover:bg-[#F5ECE5] transition-colors gap-3"
                      >
                        <p className="text-xs text-[#2D2421] italic leading-relaxed">
                          "{msg}"
                        </p>
                        <button
                          onClick={() => handleCopyCard(msg, idx)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-[#FAF0EA] text-[#B46D52] text-xs font-bold rounded-lg border border-[#E3D6CD] transition-colors whitespace-nowrap shrink-0"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Servings tip */}
                {result.servingsTip && (
                  <div className="text-xs text-[#7D6B64] bg-[#FFFBF8] p-3 rounded-lg border border-[#F3ECE6] flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span>{result.servingsTip}</span>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
};
