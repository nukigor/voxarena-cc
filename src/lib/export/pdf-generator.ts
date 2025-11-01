import puppeteer from 'puppeteer'
import { FormattedDebateData, formatDate } from './transcript-formatter'
import { marked } from 'marked'

export async function generatePDF(debateData: FormattedDebateData): Promise<Buffer> {
  const html = generateHTML(debateData)

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="width: 100%; font-size: 10px; padding: 5px 15mm; text-align: center; color: #666;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `,
    })

    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}

function generateHTML(debateData: FormattedDebateData): string {
  const transcriptHtml = marked.parse(debateData.transcript) as string

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${debateData.title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Georgia', 'Times New Roman', serif;
          line-height: 1.6;
          color: #1f2937;
          background: white;
        }

        .container {
          max-width: 100%;
          padding: 0;
        }

        .header {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }

        h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 10px;
          color: #111827;
        }

        .metadata {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 15px;
        }

        .metadata-item {
          margin-bottom: 5px;
        }

        .metadata-label {
          font-weight: 600;
          color: #374151;
        }

        .topic {
          font-size: 16px;
          font-weight: 600;
          color: #4b5563;
          margin-bottom: 10px;
        }

        .description {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 15px;
        }

        .participants {
          margin-top: 15px;
        }

        .participants-title {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .participant-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .participant {
          font-size: 13px;
          color: #4b5563;
          padding: 6px 10px;
          background: #f9fafb;
          border-radius: 4px;
        }

        .participant-name {
          font-weight: 600;
        }

        .participant-role {
          font-style: italic;
          color: #6b7280;
        }

        .transcript {
          margin-top: 30px;
        }

        .transcript h2 {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin: 25px 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }

        .transcript h3 {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin: 20px 0 12px 0;
        }

        .transcript p {
          font-size: 14px;
          margin-bottom: 12px;
          line-height: 1.7;
        }

        .transcript strong {
          font-weight: 700;
          color: #111827;
        }

        .transcript em {
          font-style: italic;
        }

        .transcript ul, .transcript ol {
          margin-left: 25px;
          margin-bottom: 12px;
        }

        .transcript li {
          font-size: 14px;
          margin-bottom: 6px;
        }

        .transcript hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 20px 0;
        }

        .transcript pre {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 12px;
          margin: 12px 0;
          overflow-x: auto;
          font-size: 13px;
        }

        .transcript code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 13px;
          font-family: 'Courier New', monospace;
        }

        .transcript pre code {
          background: none;
          padding: 0;
        }

        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${debateData.title}</h1>
          <div class="metadata">
            <div class="metadata-item">
              <span class="metadata-label">Format:</span> ${debateData.formatName}
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Generated:</span> ${formatDate(new Date())}
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Last Updated:</span> ${formatDate(debateData.updatedAt)}
            </div>
          </div>
          <div class="topic">${debateData.topic}</div>
          ${debateData.description ? `<div class="description">${debateData.description}</div>` : ''}
          <div class="participants">
            <div class="participants-title">Participants</div>
            <div class="participant-list">
              ${debateData.participants.map(p => `
                <div class="participant">
                  <span class="participant-name">${p.name}</span>
                  <span class="participant-role"> (${p.role})</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        <div class="transcript">
          ${transcriptHtml}
        </div>
      </div>
    </body>
    </html>
  `
}
