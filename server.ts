import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Endpoint: Event Catering Recommendations & Card Messages
app.post('/api/ai/event-assistant', async (req, res) => {
  try {
    const { occasion, guestCount, tone, celebrantName, preferences } = req.body;

    const prompt = `أنت خبير ضيافة وتنسيق مناسبات وتوزيعات راقية لمشروع "بهجة".
المطلوب تقديم اقتراحات ضيافة احترافية ومبهجة للمناسبة التالية:
- نوع المناسبة: ${occasion || 'حفل خاص'}
- عدد الضيوف: ${guestCount || 20}
- اسم المحتفى به / العائلة: ${celebrantName || 'ضيوفنا الكرام'}
- الطابع أو الثيم: ${tone || 'فاخر ومبهج'}
- تفضيلات خاصة: ${preferences || 'تنوع بين الموالح والحلويات'}

المطلوب إرجاع رد بصيغة JSON نظيفة وصحيحة تماماً تحتوي على:
1. "themeConcept": فكرة وتنسيق بصري ومبهج للمناسبة وألوان العلب والشرائط المقترحة.
2. "savoryMenu": مصفوفة من 3 إلى 4 أصناف ميني ساندوتش وموالح مناسبة للعدد.
3. "pastryMenu": مصفوفة من 3 إلى 4 أصناف جاتوهات وسواريه وحلويات فرنسية راقية.
4. "cardMessages": مصفوفة من 3 نصوص تهنئة مبهجة ومبتكرة لطباعتها على كروت التوزيعات.
5. "servingsTip": نصيحة خبير لحساب الكمية والتوزيع والتقديم بأبهى صورة.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating event recommendations:', error);
    // Graceful fallback response if API key is not configured or fails
    res.json({
      success: true,
      data: {
        themeConcept: 'ثيم الباستيل الذهبي مع لمسات زهور الجيبسوفيلا وشرائط الساتان العاجية لإضفاء بهجة ورقي استثنائي.',
        savoryMenu: [
          'ميني كرواسون الديك الرومي المدخن مع جبنة الشيدر والأوريغانو',
          'ميني بانيو روست بيف أنجوس مع صوص الخردل الفرنسي ومخلل الكورنيشون',
          'ميني برجر سلايدر اللحم الشهي بصوص الترافل الخاص',
          'كانابيه موس التونة والليمون المعتق مع الكبر'
        ],
        pastryMenu: [
          'ميني إكلير الشوكولاتة البلجيكية الغنية مع رقائق الذهب الغذائي',
          'تارت الفراولة والتوت البري الطازج بالكريمة الباريسية',
          'ميني تشيز كيك اللوتس المقرمش',
          'ماكرون فرنسي ملون بنكهات الفستق والورد والليمون'
        ],
        cardMessages: [
          'فرحتكم فرحتنا، ووجودكم يجمّل أوقاتنا.. دامت أيامكم عامرة بالمسرات!',
          'شكراً لمشاركتنا أجمل اللحظات.. نسعد بكم وبضحكاتكم الغالية',
          'نثرنا السكر والحب احتفالاً بكم.. بارك الله في جمعنا الطيب'
        ],
        servingsTip: 'نوصي بتقديم 3 إلى 4 قطع موالح وساندوتش لكل ضيف، مع قطعتين من الجاتوه والحلويات الفاخرة لضمان شبع وسعادة الجميع.'
      }
    });
  }
});

// AI Endpoint: Generate Custom Project / Marketing / App Prompt
app.post('/api/ai/generate-custom-prompt', async (req, res) => {
  try {
    const { promptType, brandName, targetAudience, projectDetails } = req.body;

    const systemPrompt = `أنت مهندس برومبتات (Prompt Engineer) محترف متخصص في مشاريع التجارة الإلكترونية وضيافة المناسبات.
اكتب برومبت مفصّل ومتقن باللغة العربية والإنجليزية، عالي الجودة والاحترافية وجاهز للاستخدام المباشر في أدوات الذكاء الاصطناعي (مثل Claude, ChatGPT, Midjourney, Cursor) للهدف التالي:
- نوع البرومبت: ${promptType}
- اسم المشروع: ${brandName || 'بهجة للتوزيعات'}
- الجمهور المستهدف: ${targetAudience || 'العائلات، العرائس، منسقو الحفلات، الشركات'}
- تفاصيل إضافية: ${projectDetails || 'مشروع متخصص في ميني ساندوتشات وجاتوهات فرنسية وبوكسات توزيعات هدايا'}

أرجع الرد بتنسيق JSON نظيف:
{
  "title": "عنوان البرومبت",
  "recommendedModel": "الأداة الموصى بها لاستخدام البرومبت",
  "systemInstruction": "التعليمات التوجيهية للذكاء الاصطناعي",
  "promptContent": "نص البرومبت الكامل مع المتغيرات [بين أقواس مربعة]",
  "outputExplanation": "شرح ما سينتجه هذا البرومبت وكيفية الاستفادة منه",
  "tips": ["نصيحة 1 للحصول على أفضل نتيجة", "نصيحة 2"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in custom prompt generator:', error);
    res.json({
      success: true,
      data: {
        title: 'برومبت تصميم تطبيق وضيافة المناسبات المتكامل',
        recommendedModel: 'Gemini / Claude / ChatGPT-4o',
        systemInstruction: 'أنت مصمم واجهات وخبير تجارة إلكترونية متخصص في براندات الضيافة وتوزيعات المناسبات الراقية.',
        promptContent: `قم بتطوير خطة عمل وواجهة تطبيق رقمي لمشروع [اسم المشروع] المتخصص في بوكسات وتوزيعات المناسبات (ميني ساندوتش وجاتوهات سواريه وعلب هدايا فاخرة).
الخصائص المطلوبة:
1. تجربة مستخدم ساحرة تتيح للعميل بناء البوكس المخصص (Custom Box Builder) وتحديد نسب الموالح والحلويات وشكل الشريط والكارت.
2. حاسبة ضيافة ذكية تحسب الكمية المناسبة بناءً على عدد الحضور وموعد الحفل.
3. بوابة طلب فورية تتيح التحويل للواتساب أو الدفع الإلكتروني مع إصدار فاتورة فورية ومعاينة شكل البوكس.
4. ثيم لوني مبهج ومترف يجمع بين ألوان الباستيل والذهبي الهادئ.`,
        outputExplanation: 'ينشئ هذا البرومبت رؤية معمارية وتصميمية شاملة تجعل التطبيق جاذباً ويزيد من معدل التحويل والمبيعات.',
        tips: [
          'حدد بدقة أسعار الأصناف وحجم الحصص الأدنى للطلب',
          'استخدم صوراً فوتوغرافية احترافية وعالية الدقة للبوكسات المفتوحة'
        ]
      }
    });
  }
});

// Development vs Production serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
        watch: null,
      },
      appType: 'spa',
    });

    // Prevent Vite 8's @vite/client from opening a WebSocket or throwing SendBeforeConnectError
    app.get('/@vite/client', async (req, res, next) => {
      try {
        const result = await vite.transformRequest(req.originalUrl);
        if (!result) return next();
        const startMarker = 'const transport = normalizeModuleRunnerTransport(';
        const endMarker = 'let willUnload = false;';
        const startIdx = result.code.indexOf(startMarker);
        const endIdx = result.code.indexOf(endMarker);
        let patchedCode = result.code;
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
          const noopTransport =
            'const transport = {\n' +
            '  connect: async () => {},\n' +
            '  disconnect: async () => {},\n' +
            '  send: async () => {},\n' +
            '  invoke: async () => {},\n' +
            '};\n';
          patchedCode =
            result.code.slice(0, startIdx) +
            noopTransport +
            result.code.slice(endIdx);
        }
        res
          .status(200)
          .set('Content-Type', 'application/javascript; charset=utf-8')
          .set('Cache-Control', 'no-cache')
          .send(patchedCode);
      } catch (err) {
        next(err);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Catering App Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
