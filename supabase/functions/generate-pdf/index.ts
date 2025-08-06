import { serve } from 'std/server';
import { createCanvas } from 'canvas';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface ReportData {
  metadata: any;
  datasets: any;
  configuration: any;
  results: any;
  chatSummary: any;
  recommendations: any;
}

// --- ADMIN EMAIL (must match frontend) ---
const ADMIN_EMAIL = 'creatorvision03@gmail.com';

serve(async (req) => {
  try {
    // --- ADMIN ACCESS ENFORCEMENT ---
    // Supabase passes JWT in Authorization header
    const authHeader = req.headers.get('authorization') || '';
    const jwt = authHeader.replace('Bearer ', '');
    let userEmail = '';
    if (jwt) {
      // Decode JWT (base64url, not verified here)
      const payload = jwt.split('.')[1];
      if (payload) {
        try {
          const claims = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
          userEmail = (claims.email || '').toLowerCase();
        } catch {}
      }
    }
    if (userEmail !== ADMIN_EMAIL.toLowerCase()) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admins only' }), { status: 403 });
    }

    const body = await req.json();
    const report: ReportData = body.report;

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let y = 800;
    const left = 50;
    const fontSize = 14;
    
    // Title
    page.drawText(report.metadata.title, {
      x: left,
      y,
      size: 20,
      font,
      color: rgb(0.1, 0.2, 0.7)
    });
    y -= 30;

    // Metadata
    page.drawText(`Generated At: ${report.metadata.generatedAt}`, { x: left, y, size: fontSize, font });
    y -= 20;
    page.drawText(`User: ${report.metadata.user}`, { x: left, y, size: fontSize, font });
    y -= 30;

    // Datasets
    page.drawText(`Datasets Used: ${report.datasets.count}`, { x: left, y, size: fontSize, font });
    y -= 20;
    report.datasets.details.forEach((ds: any) => {
      page.drawText(`- ${ds.name} (${ds.rows} rows, ${ds.columns} columns)`, { x: left + 20, y, size: fontSize - 2, font });
      y -= 16;
    });
    y -= 16;

    // Configuration
    page.drawText(`Forecast Configuration:`, { x: left, y, size: fontSize, font });
    y -= 20;
    page.drawText(`Algorithms: ${report.configuration.algorithms.join(', ')}`, { x: left + 20, y, size: fontSize - 2, font });
    y -= 16;
    page.drawText(`Horizon: ${report.configuration.horizon}`, { x: left + 20, y, size: fontSize - 2, font });
    y -= 16;
    page.drawText(`Seasonality: ${report.configuration.seasonality}`, { x: left + 20, y, size: fontSize - 2, font });
    y -= 16;
    page.drawText(`Confidence Interval: ${report.configuration.confidenceInterval}`, { x: left + 20, y, size: fontSize - 2, font });
    y -= 30;

    // Results
    page.drawText(`Forecast Models:`, { x: left, y, size: fontSize, font });
    y -= 20;
    report.results.allModels.forEach((m: any) => {
      page.drawText(`- ${m.model}: MAPE ${m.mape}, RMSE ${m.rmse}, MAE ${m.mae}`, { x: left + 20, y, size: fontSize - 2, font });
      y -= 16;
    });
    y -= 16;
    if (report.results.bestModel) {
      page.drawText(`Best Model: ${report.results.bestModel.name} (MAPE ${report.results.bestModel.mape})`, { x: left, y, size: fontSize, font });
      y -= 20;
    }

    // Chat Summary
    page.drawText(`Chat Summary:`, { x: left, y, size: fontSize, font });
    y -= 20;
    page.drawText(`User Questions: ${report.chatSummary.userQuestions}, AI Responses: ${report.chatSummary.aiResponses}`, { x: left + 20, y, size: fontSize - 2, font });
    y -= 16;
    report.chatSummary.keyInteractions.forEach((msg: any) => {
      page.drawText(`- [${msg.type}] ${msg.content}`, { x: left + 20, y, size: fontSize - 4, font });
      y -= 14;
    });
    y -= 16;

    // Recommendations
    page.drawText(`Recommendations:`, { x: left, y, size: fontSize, font });
    y -= 20;
    report.recommendations.forEach((rec: any) => {
      page.drawText(`- (${rec.level}) ${rec.message}`, { x: left + 20, y, size: fontSize - 2, font });
      y -= 16;
    });

    // Serialize PDF
    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="DUFA_Report.pdf"',
      },
      status: 200
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
